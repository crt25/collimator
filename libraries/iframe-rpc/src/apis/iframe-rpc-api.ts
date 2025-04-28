import {
  IframeRpcRequest,
  IframeRpcError,
  IframeRpcResult,
} from "../remote-procedure-call";
import { ParametersOf, ResultOf } from "../utils";

const MAX_COUNTER = 1000000;

export type IframeApiResponse<
  Method extends string,
  TResult extends IframeRpcResult<Method>,
> = ResultOf<TResult>;

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
  TCallerProcedures extends string,
  TCalleeProcedures extends string,
  TCallerRequest extends IframeRpcRequest<TCallerProcedures>,
  TCalleeRequest extends IframeRpcRequest<TCalleeProcedures>,
  TCallerResult extends IframeRpcResult<TCalleeProcedures>,
  TCalleeResult extends IframeRpcResult<TCallerProcedures>,
  TErrorResponse extends
    IframeRpcError<TCalleeProcedures> = IframeRpcError<TCalleeProcedures>,
> {
  private readonly pendingRequests: {
    [key: number]: {
      resolve: (response: TCalleeResult) => void;
      reject: (error?: string) => void;
    };
  } = {};

  private requestOrigin: string | null = null;
  private requestTarget: MessageTarget | null = null;
  private counter = 0;

  constructor(
    private onRequest: HandleRequestMap<
      TCalleeProcedures,
      TCalleeRequest,
      TCallerResult
    >,
  ) {}

  setOnRequest(
    onRequest: HandleRequestMap<
      TCalleeProcedures,
      TCalleeRequest,
      TCallerResult
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
    message: TCallerRequest | TCallerResult | TErrorResponse,
    targetOrigin: string,
  ): void {
    target.postMessage(message, {
      targetOrigin: targetOrigin,
    });
  }

  private respondToRequest<Method extends TCalleeProcedures>(
    event: MessageEvent,
    id: number,
    method: Method,
    result: ResultOf<TCallerResult & { method: Method }> | undefined,
    error?: string,
  ): void {
    if (!event.source) {
      console.error("Cannot respond to event without source:", event);
      return;
    }

    return this.sendMessage(
      event.source,
      result !== undefined
        ? this.createResponse(id, method, result)
        : this.createErrorResponse(id, method, error),
      event.origin,
    );
  }

  sendRequest<ProcedureName extends TCallerProcedures>(
    method: ProcedureName,
    parameters: ParametersOf<TCallerRequest & { method: ProcedureName }>,
  ): Promise<TCalleeResult & { method: ProcedureName }> {
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
      this.pendingRequests[this.counter] = {
        resolve: (response: TCalleeResult): void => {
          if (response.method !== request.method) {
            console.error("Invalid response procedure", response, request);
            return;
          }

          resolve(
            response as TCalleeResult & {
              method: ProcedureName;
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
      return;
    }

    const message = event.data as
      | TCalleeRequest
      | TCalleeResult
      | TErrorResponse;

    if (this.isResponse(message)) {
      const response: TCalleeResult | TErrorResponse = message;

      console.debug("Received IframeRPC response", response);

      // get the resolve function from the pendingRequests object
      const handleResponse = this.pendingRequests[response.id];
      if (!handleResponse) {
        console.error("No resolve function found for message", response);
      }

      // call the resolve function with the message
      if (this.isErrorResponse(response)) {
        const errorMessage =
          "error" in response ? response.error : "Unknown error";

        handleResponse.reject(errorMessage);
      } else {
        handleResponse.resolve(
          // unfortunately typescript cannot infer the type
          response as TCalleeResult,
        );
      }
      // remove the resolve function from the pendingRequests object
      delete this.pendingRequests[message.id];

      return;
    }

    const request: TCalleeRequest = message;
    const handleRequest = this.onRequest[request.method];

    console.debug("Received IframeRPC request", request);

    try {
      const response = await handleRequest(message, event);
      this.respondToRequest(event, request.id, request.method, response);
    } catch (e) {
      console.error("Error handling request", e, message);

      this.respondToRequest(
        event,
        request.id,
        request.method,
        undefined,
        e instanceof Error ? e.message : "Unkown error",
      );
    }
  }

  private isResponse(
    message: TCalleeRequest | TCalleeResult | TErrorResponse,
  ): message is TCalleeResult | TErrorResponse {
    return "response" in message || "error" in message;
  }

  private isErrorResponse(
    message: TCalleeResult | TErrorResponse,
  ): message is TErrorResponse {
    return "error" in message;
  }

  protected abstract createRequest<Method extends TCallerProcedures>(
    id: number,
    method: Method,
    parameters: ParametersOf<TCallerRequest & { method: Method }>,
  ): TCallerRequest & { method: Method };

  protected abstract createResponse<Method extends TCalleeProcedures>(
    id: number,
    method: Method,
    result: ResultOf<TCallerResult & { method: Method }>,
  ): TCallerResult & { method: Method };

  protected abstract createErrorResponse(
    id: number,
    method: TCalleeProcedures,
    error?: string,
  ): TErrorResponse;
}
