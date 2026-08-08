import { AppCrtIframeApi, AppHandleRequestMap } from "iframe-rpc/src";

/**
 * Regression test for CRT-470.
 *
 * The RPC message listener is attached to `window`, so it receives *every*
 * message dispatched at that window - not only RPC traffic. The most common
 * foreign message is the `setimmediate` polyfill (bundled into JupyterLab and
 * Scratch), which schedules macrotasks by posting a
 * `"setImmediate$<rand>$<handle>"` string to its own window. These fire in huge
 * volume during app boot and previously flooded the console with
 * "Received message from unknown source" logs.
 *
 * `handleWindowMessage` must silently ignore non-object payloads while still
 * routing genuine JSON-RPC objects.
 */
describe("IframeRpcApi.handleWindowMessage", () => {
  // Fake peer windows. `postMessage` is stubbed because responding to a routed
  // request posts back to `event.source`.
  const targetWindow = {
    name: "rpc-peer",
    postMessage: jest.fn(),
  } as unknown as Window;
  const otherWindow = {
    name: "self",
    postMessage: jest.fn(),
  } as unknown as Window;

  let consoleDebug: jest.SpyInstance;

  const createApi = (
    handleRequest: AppHandleRequestMap | null = null,
  ): AppCrtIframeApi => {
    const api = new AppCrtIframeApi(handleRequest);
    api.setTarget(targetWindow);
    api.setOrigin("https://example.test");
    return api;
  };

  const messageEvent = (data: unknown, source: Window | null): MessageEvent =>
    new MessageEvent("message", {
      data,
      source,
      origin: "https://example.test",
    });

  beforeEach(() => {
    consoleDebug = jest.spyOn(console, "debug").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleDebug.mockRestore();
  });

  it("silently ignores the setImmediate polyfill payload", async () => {
    const api = createApi();

    // Same shape the setimmediate polyfill posts, from a mismatched source.
    await api.handleWindowMessage(
      messageEvent("setImmediate$0.34213620966509795$1", otherWindow),
    );

    expect(consoleDebug).not.toHaveBeenCalledWith(
      "Received message from unknown source",
      expect.anything(),
      expect.anything(),
      expect.anything(),
    );
  });

  it("ignores non-object payloads without logging (string, number, null)", async () => {
    const api = createApi();

    for (const payload of ["some string", 42, null]) {
      await api.handleWindowMessage(messageEvent(payload, otherWindow));
    }

    expect(consoleDebug).not.toHaveBeenCalledWith(
      "Received message from unknown source",
      expect.anything(),
      expect.anything(),
      expect.anything(),
    );
  });

  it("still logs object messages from an unexpected source", async () => {
    const api = createApi();

    await api.handleWindowMessage(
      messageEvent({ jsonrpc: "2.0", id: 1, method: "getHeight" }, otherWindow),
    );

    expect(consoleDebug).toHaveBeenCalledWith(
      "Received message from unknown source",
      otherWindow,
      "expected",
      targetWindow,
    );
  });

  it("routes a valid RPC request from the expected source to its handler", async () => {
    const getHeight = jest.fn().mockResolvedValue(123);
    const api = createApi({ getHeight } as unknown as AppHandleRequestMap);

    await api.handleWindowMessage(
      messageEvent(
        { jsonrpc: "2.0", id: 1, method: "getHeight" },
        targetWindow,
      ),
    );

    expect(getHeight).toHaveBeenCalledTimes(1);
  });
});
