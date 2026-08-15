import {
  IframeRpcRequest,
  IframeRpcError,
  IframeRpcResult,
} from "../remote-procedure-call";
import { ParametersOf, ResultOf } from "../utils";

const MAX_COUNTER = 1000000;

type IframeApiResponse<
  Method extends string,
  TResult extends IframeRpcResult<Method>,
> = ResultOf<TResult> extends never ? undefined : ResultOf<TResult>;

type HandleRequest<
  Method extends string,
  TRequest,
  TResult extends IframeRpcResult<Method>,
> = (
  request: TRequest & { method: Method },
  event: MessageEvent,
) => Promise<IframeApiResponse<Method, TResult>>;

export type HandleRequestMap<
  Methods extends string,
  TRequest,
  TResult extends IframeRpcResult<Methods>,
> = {
  [Method in Methods]: HandleRequest<
    Method,
    TRequest,
    TResult & { method: Method }
  >;
};

export type MessageTarget = Window | MessagePort | ServiceWorker;

/**
 * Raised when an iframe navigates before a request to its previous document
 * can answer. Consumers may use this to distinguish an expected reload from
 * an application/RPC failure.
 */
export class IframeDocumentReplacedError extends Error {
  constructor() {
    super("The iframe document was replaced before the request completed");
    this.name = "IframeDocumentReplacedError";
  }
}

export abstract class IframeRpcApi<
  /**
   * The methods this instance can call on the iframe.
   */
  TOutgoingMethods extends string,
  /**
   * The methods the iframe can call on this instance.
   */
  TIncomingMethods extends string,
  /**
   * The requests this instance can send to the iframe.
   */
  TOutgoingRequests extends IframeRpcRequest<TOutgoingMethods>,
  /**
   * The requests the iframe can send to this instance.
   */
  TIncomingRequests extends IframeRpcRequest<TIncomingMethods>,
  /**
   * The responses this instance may send to the iframe as the response to a request.
   */
  TOutgoingResult extends IframeRpcResult<TIncomingMethods>,
  /**
   * The responses the iframe may send to this instance as the response to a request.
   */
  TIncomingResult extends IframeRpcResult<TOutgoingMethods>,
  /**
   * The error response this instance may send to the iframe as the response to a request.
   */
  TOutgoingErrorResponse extends
    IframeRpcError<TIncomingMethods> = IframeRpcError<TIncomingMethods>,
> {
  private readonly pendingRequests: {
    [key: number]: {
      resolve: (response: TIncomingResult) => void;
      reject: (error: Error) => void;
    };
  } = {};

  private requestOrigin: string | null = null;
  private requestTarget: MessageTarget | null = null;
  private counter = 0;

  /**
   * Buffer for incoming requests received before onRequest handler is set.
   */
  private bufferedRequests: {
    request: TIncomingRequests;
    event: MessageEvent;
  }[] = [];

  constructor(
    private onRequest: HandleRequestMap<
      TIncomingMethods,
      TIncomingRequests,
      TOutgoingResult
    > | null = null,
  ) {}

  setOnRequest(
    onRequest: HandleRequestMap<
      TIncomingMethods,
      TIncomingRequests,
      TOutgoingResult
    > | null,
  ): void {
    this.onRequest = onRequest;

    if (this.onRequest !== null) {
      // Process buffered requests
      const bufferedRequests = this.bufferedRequests;
      this.bufferedRequests = [];

      for (const { request, event } of bufferedRequests) {
        this.handleRequest(request, event);
      }
    }
  }

  setOrigin(origin: string | null): void {
    this.requestOrigin = origin;
  }

  setTarget(target: MessageTarget): void {
    this.requestTarget = target;
  }

  replaceTarget(target: MessageTarget): void {
    const pendingRequests = Object.entries(this.pendingRequests);

    // clear first so a rejection handler cannot observe or settle stale state
    for (const [id] of pendingRequests) {
      delete this.pendingRequests[Number(id)];
    }

    const error = new IframeDocumentReplacedError();
    for (const [, request] of pendingRequests) {
      request.reject(error);
    }

    this.requestTarget = target;
  }

  private sendMessage(
    target: MessageTarget,
    message: TOutgoingRequests | TOutgoingResult | TOutgoingErrorResponse,
    targetOrigin: string,
  ): void {
    target.postMessage(message, {
      targetOrigin: targetOrigin,
    });
  }

  private respondToRequest<Method extends TIncomingMethods>(
    event: MessageEvent,
    id: number,
    method: Method,
    result: ResultOf<TOutgoingResult & { method: Method }> | undefined,
    error?: string,
  ): void {
    if (!event.source) {
      console.error("Cannot respond to event without source:", event);
      return;
    }

    return this.sendMessage(
      event.source,
      error !== undefined
        ? this.createErrorResponse(id, method, error)
        : this.createResponse(id, method, result),
      event.origin,
    );
  }

  sendRequest<Method extends TOutgoingMethods>(
    method: Method,
    parameters: ParametersOf<TOutgoingRequests & { method: Method }>,
  ): Promise<TIncomingResult & { method: Method }> {
    const { requestOrigin, requestTarget } = this;

    if (requestOrigin === null || requestTarget === null) {
      return Promise.reject(
        new Error(
          `Cannot send messages (yet) because either the request origin (${requestOrigin}) or the request target (${requestTarget}) has not been set`,
        ),
      );
    }

    const request = this.createRequest(this.counter, method, parameters);

    // increment the counter
    this.counter = (this.counter + 1) % MAX_COUNTER;

    return new Promise((resolve, reject) => {
      // store the resolve function in the pendingRequests object
      this.pendingRequests[request.id] = {
        resolve: (response: TIncomingResult): void => {
          if (response.method !== request.method) {
            console.error("Invalid response procedure", response, request);
            reject(
              new Error(
                `Invalid response procedure ${response.method}, expected ${request.method}`,
              ),
            );
            return;
          }

          resolve(
            response as TIncomingResult & {
              method: Method;
            },
          );
        },
        reject: (error: Error): void => {
          reject(error);
        },
      };

      // send the message to the iframe
      console.debug("Sending IframeRPC request", request);
      this.sendMessage(requestTarget, request, requestOrigin);
    });
  }

  public async handleWindowMessage(event: MessageEvent): Promise<void> {
    // Ignore non-RPC messages. RPC messages are always JSON-RPC objects; a
    // non-object payload can only be foreign traffic on the shared `message`
    // channel. The most common source is the `setimmediate` polyfill (bundled
    // into JupyterLab and Scratch), which schedules macrotasks by posting a
    // `"setImmediate$<rand>$<handle>"` string to its own window. These fire in
    // huge volume during app boot; without this guard every one is logged as an
    // "unknown source" message.
    if (typeof event.data !== "object" || event.data === null) {
      return;
    }

    if (event.source !== this.requestTarget) {
      console.debug(
        "Received message from unknown source",
        event.source,
        "expected",
        this.requestTarget,
      );
      return;
    }

    const message = event.data as
      | TIncomingRequests
      | TIncomingResult
      | TOutgoingErrorResponse;

    return this.isResponse(message)
      ? this.handleReponse(message)
      : this.handleRequest(message, event);
  }

  private async handleReponse(
    response: TIncomingResult | TOutgoingErrorResponse,
  ): Promise<void> {
    console.debug("Received IframeRPC response", response);

    // get the resolve function from the pendingRequests object
    const handleResponse = this.pendingRequests[response.id];
    if (!handleResponse) {
      // Expected across embedded-app reloads and remounts: a remounted app
      // replays buffered requests and answers them a second time, and a
      // document that navigated away can be answered after a fresh RPC
      // instance took over. Drop the response instead of throwing (CRT-464).
      console.warn("No resolve function found for message", response);
      return;
    }

    // call the resolve function with the message
    if (this.isErrorResponse(response)) {
      const errorMessage =
        ("error" in response ? response.error : undefined) ?? "Unknown error";

      console.error("Error in response", errorMessage, response);
      handleResponse.reject(new Error(errorMessage));
    } else {
      handleResponse.resolve(response);
    }
    // remove the resolve function from the pendingRequests object
    delete this.pendingRequests[response.id];
  }

  private async handleRequest(
    request: TIncomingRequests,
    event: MessageEvent,
  ): Promise<void> {
    if (this.onRequest === null) {
      this.bufferedRequests.push({ request, event });
      return;
    }

    const fn = this.onRequest[request.method];

    if (typeof fn !== "function") {
      console.error("No handler for request", request.method, request);

      this.respondToRequest(
        event,
        request.id,
        request.method,
        undefined,
        `No handler for method ${request.method}`,
      );

      return;
    }

    console.debug("Received IframeRPC request", request);

    try {
      const response = await fn(request, event);
      this.respondToRequest(event, request.id, request.method, response);
    } catch (e) {
      console.error("Error handling request", e, request);

      this.respondToRequest(
        event,
        request.id,
        request.method,
        undefined,
        e instanceof Error ? e.message : "Unknown error",
      );
    }
  }

  private isResponse(
    message: TIncomingRequests | TIncomingResult | TOutgoingErrorResponse,
  ): message is TIncomingResult | TOutgoingErrorResponse {
    return "result" in message || "error" in message;
  }

  private isErrorResponse(
    message: TIncomingResult | TOutgoingErrorResponse,
  ): message is TOutgoingErrorResponse {
    return "error" in message;
  }

  protected abstract createRequest<Method extends TOutgoingMethods>(
    id: number,
    method: Method,
    parameters: ParametersOf<TOutgoingRequests & { method: Method }>,
  ): TOutgoingRequests & { method: Method };

  protected abstract createResponse<Method extends TIncomingMethods>(
    id: number,
    method: Method,
    result: ResultOf<TOutgoingResult & { method: Method }> | undefined,
  ): TOutgoingResult & { method: Method };

  protected abstract createErrorResponse(
    id: number,
    method: TIncomingMethods,
    error?: string,
  ): TOutgoingErrorResponse;
}
