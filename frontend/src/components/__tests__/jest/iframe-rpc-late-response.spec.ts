import { PlatformCrtIframeApi } from "iframe-rpc/src";

// Across embedded-app reloads and remounts, a response can arrive for a
// request id that has no pending resolver anymore: the app replays buffered
// requests after a remount and answers them a second time, or a document
// that navigated away is answered after a fresh RPC instance took over.
// Those late responses must be dropped, not thrown on (CRT-464).
describe("IframeRpcApi late responses", () => {
  it("ignores a response no request is waiting for", async () => {
    const api = new PlatformCrtIframeApi(null);
    const target = { postMessage: jest.fn() };

    api.setTarget(target as unknown as Window);

    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const error = jest.spyOn(console, "error").mockImplementation(() => {});

    try {
      await expect(
        api.handleWindowMessage({
          source: target,
          data: {
            jsonrpc: "2.0",
            id: 99,
            method: "getHeight",
            result: 42,
          },
        } as unknown as MessageEvent),
      ).resolves.toBeUndefined();

      expect(warn).toHaveBeenCalled();
      // the late response must be dropped quietly, not surfaced as an error
      // (the pre-fix code threw from the handler)
      expect(error).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
      error.mockRestore();
    }
  });

  // companion to the above: dropping unknown-id responses must not regress the
  // normal path where a response resolves its pending request.
  it("still resolves a response its request is waiting for", async () => {
    const api = new PlatformCrtIframeApi(null);
    const target = { postMessage: jest.fn() };

    api.setOrigin("https://example.com");
    api.setTarget(target as unknown as Window);

    const pending = api.sendRequest("getHeight", undefined);

    const sentRequest = target.postMessage.mock.calls[0][0] as { id: number };

    await api.handleWindowMessage({
      source: target,
      origin: "https://example.com",
      data: {
        jsonrpc: "2.0",
        id: sentRequest.id,
        method: "getHeight",
        result: 42,
      },
    } as unknown as MessageEvent);

    await expect(pending).resolves.toMatchObject({
      method: "getHeight",
      result: 42,
    });
  });
});
