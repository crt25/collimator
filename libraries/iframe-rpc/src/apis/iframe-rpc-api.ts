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
      reject: (error?: string) => void;
    };
  } = {};

  private requestOrigin: string | null = null;
  private requestTarget: MessageTarget | null = null;
  private counter = 0;

  /**
   * Buffer for incoming requests received before onRequest handler is set.
   */
  private bufferedRequests: {request: TIncomingRequests; event: MessageEvent}[] = [];

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

    if(this.onRequest !== null){
      // Process buffered requests
      const bufferedRequests = this.bufferedRequests;
      this.bufferedRequests = [];

      for (const {request, event} of bufferedRequests) {
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
        reject: (error?: string): void => {
          console.error("Error in response", error, request);
          reject(new Error(error));
        },
      };

      // send the message to the iframe
      console.debug("Sending IframeRPC request", request);
      this.sendMessage(requestTarget, request, requestOrigin);
    });
  }

  /**
   * Decides whether an incoming window message belongs to this RPC channel.
   *
   * We cannot rely on strict `event.source === requestTarget` identity alone:
   * the counterpart window can be legitimately re-created (e.g. the host swaps
   * the iframe via a `key` change, or the iframe navigates and gets a fresh
   * `contentWindow`), which invalidates the cached reference even though the
   * message is genuine. Conversely, unrelated posters (browser extensions,
   * dev-server HMR, devtools) post to the same `window` and must be rejected.
   *
   * The authoritative trust boundary for `postMessage` is the origin, so we
   * accept a message when EITHER:
   *  - its source is exactly the cached target (fast path, no origin needed), OR
   *  - a `requestOrigin` has been configured and the message's origin matches it.
   *
   * When neither matches the source is genuinely unknown and is ignored.
   */
  private isExpectedSource(event: MessageEvent): boolean {
    if (this.requestTarget !== null && event.source === this.requestTarget) {
      return true;
    }

    // Fall back to the origin check only when an expected origin is known.
    // An empty/"null" origin (opaque origins) never satisfies this and is
    // therefore not trusted.
    if (
      this.requestOrigin !== null &&
      this.requestOrigin !== "*" &&
      event.origin !== "" &&
      event.origin === this.requestOrigin
    ) {
      return true;
    }

    return false;
  }

  public async handleWindowMessage(event: MessageEvent): Promise<void> {
    if (!this.isExpectedSource(event)) {
      // Genuinely-unknown source: ignore silently. These messages arrive on
      // every keystroke from extensions/HMR/devtools, so logging here would
      // flood the console in a continuous loop without indicating a real fault.
      return;
    }

    // Self-heal the cached target when the trusted counterpart has been
    // re-created (matched via origin above but a different Window object).
    // Without this, later `sendRequest` calls would post to a stale/detached
    // window. `event.source` is only ever a Window for window-message events.
    if (
      event.source !== null &&
      event.source !== this.requestTarget &&
      event.source instanceof Window
    ) {
      this.requestTarget = event.source;
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
      console.error("No resolve function found for message", response);
      throw new Error("No resolve function found for message");
    }

    // call the resolve function with the message
    if (this.isErrorResponse(response)) {
      const errorMessage =
        ("error" in response ? response.error : undefined) ?? "Unknown error";

      handleResponse.reject(errorMessage);
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
    if(this.onRequest === null){
      this.bufferedRequests.push({request, event});
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
