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

  constructor(
    private onRequest: HandleRequestMap<
      TIncomingMethods,
      TIncomingRequests,
      TOutgoingResult
    >,
  ) {}

  setOnRequest(
    onRequest: HandleRequestMap<
      TIncomingMethods,
      TIncomingRequests,
      TOutgoingResult
    >,
  ): void {
    this.onRequest = onRequest;
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

  public async handleWindowMessage(event: MessageEvent): Promise<void> {
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
      console.error("No resolve function found for message", response);
      throw new Error("No resolve function found for message");
    }

    // call the resolve function with the message
    if (this.isErrorResponse(response)) {
      const errorMessage =
        ("error" in response ? response.error : undefined) ?? "Unknown error";

      handleResponse.reject(errorMessage);
    } else {
      handleResponse.resolve(
        // unfortunately typescript cannot infer the type
        response as TIncomingResult,
      );
    }
    // remove the resolve function from the pendingRequests object
    delete this.pendingRequests[response.id];
  }

  private async handleRequest(
    request: TIncomingRequests,
    event: MessageEvent,
  ): Promise<void> {
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
