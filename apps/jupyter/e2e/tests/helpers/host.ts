/**
 * Stand-in for the platform, i.e. the page that normally embeds the Jupyter
 * app in an iframe and talks to it through JSON-RPC messages.
 *
 * The app is loaded as a top-level page. Before any of its scripts run,
 * `window.parent` is replaced by a stub, so the app believes it is embedded:
 * - everything the app posts to its parent is recorded,
 * - requests the app sends to the platform are acknowledged, like the real
 *   platform does, so the app never waits for an answer that cannot come,
 * - tests call the app by dispatching message events whose source is the stub.
 */
import { Page } from "@playwright/test";
import type { RpcMethodName } from "../../../../../libraries/iframe-rpc/src/methods/rpc-method-names";

export type AppMode = "edit" | "solve" | "show";

export type RpcMessage = {
  jsonrpc: "2.0";
  id: number;
  method: RpcMethodName;
  params?: unknown;
  result?: unknown;
  error?: string;
};

declare global {
  interface Window {
    crtHost: {
      parent: { postMessage: (message: unknown, options?: unknown) => void };
      // everything the app posted to the platform, in order
      posted: RpcMessage[];
      dispatch: (data: unknown) => void;
    };
  }
}

const extensionActivatedMessage = "notebook-runner is activated";

// ids of requests sent by the tests, far away from the ids the app uses for
// its own requests to the platform
let nextRequestId = 100_000;

const installHostStub = async (page: Page): Promise<void> => {
  await page.addInitScript(() => {
    // only the app itself is embedded, not the frames it may create
    if (window !== window.top) {
      return;
    }

    const isRpcMessage = (value: unknown): value is RpcMessage =>
      typeof value === "object" && value !== null && "method" in value;

    const isRequest = (message: RpcMessage): boolean =>
      !("result" in message) && !("error" in message);

    const dispatch = (data: unknown): void => {
      const event = new Event("message");

      Object.defineProperties(event, {
        source: { value: window.crtHost.parent },
        origin: { value: window.location.origin },
        data: { value: data },
      });

      window.dispatchEvent(event);
    };

    window.crtHost = {
      posted: [],
      dispatch,
      parent: {
        postMessage: (message: unknown): void => {
          if (!isRpcMessage(message)) {
            return;
          }

          window.crtHost.posted.push(message);

          if (isRequest(message)) {
            // acknowledge asynchronously, as a real message would arrive
            setTimeout(() =>
              dispatch({
                jsonrpc: "2.0",
                id: message.id,
                method: message.method,
                result: undefined,
              }),
            );
          }
        },
      },
    };

    Object.defineProperty(window, "parent", {
      configurable: true,
      get: () => window.crtHost.parent,
    });
  });
};

/**
 * Opens the app in the given mode with the platform replaced by the stub and
 * waits until the notebook-runner extension has been activated.
 */
export const openApp = async (page: Page, mode: AppMode): Promise<void> => {
  await installHostStub(page);

  const activated = page.waitForEvent("console", {
    predicate: (message) => message.text().includes(extensionActivatedMessage),
    timeout: 120 * 1000,
  });

  await page.goto(`lab/index.html?crtMode=${mode}`);
  await activated;
};

/**
 * A file in request parameters or in a response. Files cannot cross the
 * boundary between the test and the page as such, so they travel as base64
 * and are turned into (or read from) Blobs inside the page.
 */
export type FileData = {
  $file: { base64: string; type: string; size: number };
};

export const fileData = (content: Buffer, type: string): FileData => ({
  $file: { base64: content.toString("base64"), type, size: content.length },
});

export const fileContent = (file: FileData): Buffer =>
  Buffer.from(file.$file.base64, "base64");

/**
 * Sends a request to the app as the platform would and returns its response.
 * Files are passed and returned as FileData.
 */
export const sendRequest = async (
  page: Page,
  method: RpcMethodName,
  params?: unknown,
  timeout = 150 * 1000,
): Promise<RpcMessage> => {
  const id = await dispatchRequest(page, method, params);

  const handle = await page.waitForFunction(
    (requestId) =>
      window.crtHost.posted.find(
        (message) =>
          message.id === requestId &&
          ("result" in message || "error" in message),
      ),
    id,
    { timeout },
  );

  return handle.evaluate(async (response) => {
    // waitForFunction only resolves once the response exists
    const message = response as RpcMessage;

    const toBase64 = async (blob: Blob): Promise<string> => {
      const bytes = new Uint8Array(await blob.arrayBuffer());
      const chunkSize = 0x8000;
      let binary = "";

      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
      }

      return btoa(binary);
    };

    const describe = async (value: unknown): Promise<unknown> => {
      if (value instanceof Blob) {
        return {
          $file: {
            base64: await toBase64(value),
            type: value.type,
            size: value.size,
          },
        };
      }

      if (Array.isArray(value)) {
        return Promise.all(value.map(describe));
      }

      if (typeof value === "object" && value !== null) {
        return Object.fromEntries(
          await Promise.all(
            Object.entries(value).map(async ([key, entry]) => [
              key,
              await describe(entry),
            ]),
          ),
        );
      }

      return value;
    };

    return {
      jsonrpc: message.jsonrpc,
      id: message.id,
      method: message.method,
      error: message.error,
      result: await describe(message.result ?? null),
    };
  });
};

const dispatchRequest = async (
  page: Page,
  method: RpcMethodName,
  params?: unknown,
): Promise<number> => {
  const id = nextRequestId++;

  await page.evaluate(
    ({ id, method, params }) => {
      const revive = (value: unknown): unknown => {
        if (typeof value !== "object" || value === null) {
          return value;
        }

        if (Array.isArray(value)) {
          return value.map(revive);
        }

        if ("$file" in value) {
          const { base64, type } = value.$file as {
            base64: string;
            type: string;
          };
          const binary = atob(base64);
          const bytes = new Uint8Array(binary.length);

          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }

          return new Blob([bytes], { type });
        }

        return Object.fromEntries(
          Object.entries(value).map(([key, entry]) => [key, revive(entry)]),
        );
      };

      window.crtHost.dispatch({
        jsonrpc: "2.0",
        id,
        method,
        params: revive(params),
      });
    },
    { id, method, params },
  );

  return id;
};

/**
 * The requests the app sent to the platform so far, e.g. "postMessage".
 */
export const getRequestsFromApp = (
  page: Page,
  method?: RpcMethodName,
): Promise<Pick<RpcMessage, "id" | "method">[]> =>
  page.evaluate(
    (method) =>
      window.crtHost.posted
        .filter(
          (message) =>
            !("result" in message) &&
            !("error" in message) &&
            (method === undefined || message.method === method),
        )
        .map(({ id, method }) => ({ id, method })),
    method,
  );
