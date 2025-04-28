import {
  IframeRpcRequest,
  IframeRpcError,
  IframeRpcResult,
} from "../remote-procedure-call";

const MAX_COUNTER = 1000000;

export type IframeApiResponse<Method extends string, TResponse> = Omit<
  TResponse & { method: Method },
  "id"
>;

type HandleRequest<Method extends string, TRequest, TResponse> = (
  request: TRequest & { method: Method },
  event: MessageEvent,
) => Promise<IframeApiResponse<Method, TResponse>>;

export type HandleRequestMap<Procedures extends string, TRequest, TResponse> = {
  [Procedure in Procedures]: HandleRequest<Procedure, TRequest, TResponse>;
};

export type MessageTarget = Window | MessagePort | ServiceWorker;

export abstract class IframeRpcApi<
  TCallerProcedures extends string,
  TCalleeProcedures extends string,
  TCallerRequest extends IframeRpcRequest<TCallerProcedures>,
  TCalleeRequest extends IframeRpcRequest<TCalleeProcedures>,
  TCallerResponse extends
    | IframeRpcResult<TCalleeProcedures>
    | IframeRpcError<TCalleeProcedures>,
  TCalleeResponse extends
    | IframeRpcResult<TCallerProcedures>
    | IframeRpcError<TCallerProcedures>,
> {
  private readonly pendingRequests: {
    [key: number]: {
      resolve: (response: TCalleeResponse) => void;
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
      TCallerResponse
    >,
  ) {}

  setOnRequest(
    onRequest: HandleRequestMap<
      TCalleeProcedures,
      TCalleeRequest,
      TCallerResponse
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
    message: TCallerRequest | TCallerResponse,
    targetOrigin: string,
  ): void {
    target.postMessage(message, {
      targetOrigin: targetOrigin,
    });
  }

  private respondToRequest(
    event: MessageEvent,
    message: Omit<TCallerResponse, "id">,
  ): void {
    if (!event.source) {
      console.error("Cannot respond to event without source:", event);
      return;
    }

    return this.sendMessage(
      event.source,
      {
        id: (event.data as TCalleeRequest).id,
        ...message,
        // unfortunately typescript cannot infer the type here but it is
        // easy to check manually that id is now set.
      } as TCallerResponse,
      event.origin,
    );
  }

  sendRequest<ProcedureName extends TCallerProcedures>(
    request: Omit<TCallerRequest, "id"> & {
      method: ProcedureName;
    },
  ): Promise<TCalleeResponse & { method: ProcedureName }> {
    const { requestOrigin, requestTarget } = this;

    if (requestOrigin === null || requestTarget === null) {
      return Promise.reject(
        new Error(
          `Cannot send messages (yet) because either the request origin (${requestOrigin}) or the request target (${requestTarget}) has not been set`,
        ),
      );
    }

    return new Promise((resolve, reject) => {
      // store the resolve function in the pendingRequests object
      this.pendingRequests[this.counter] = {
        resolve: (response: TCalleeResponse): void => {
          if (response.method !== request.method) {
            console.error("Invalid response procedure", response, request);
            return;
          }

          resolve(
            response as TCalleeResponse & {
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
      this.sendMessage(
        requestTarget,
        // add a unique id to the message
        {
          id: this.counter,
          ...request,
          // unfortunately typescript cannot infer the type here but it is
          // easy to check manually that id and type are now set.
        } as unknown as TCallerRequest,
        requestOrigin,
      );

      // increment the counter
      this.counter = (this.counter + 1) % MAX_COUNTER;
    });
  }

  public async handleWindowMessage(event: MessageEvent): Promise<void> {
    if (event.source !== this.requestTarget) {
      return;
    }

    const message = event.data as TCalleeRequest | TCalleeResponse;

    if (this.isResponse(message)) {
      const response: TCalleeResponse = message;

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
          response as TCalleeResponse,
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
      this.respondToRequest(event, response);
    } catch (e) {
      console.error("Error handling request", e, message);

      this.respondToRequest(
        event,
        this.createErrorResponse(
          request.method,
          e instanceof Error ? e.message : "Unkown error",
        ),
      );
    }
  }

  private isResponse(
    message: TCalleeRequest | TCalleeResponse,
  ): message is TCalleeResponse {
    return "response" in message || "error" in message;
  }

  private isErrorResponse(
    message:
      | IframeRpcResult<TCallerProcedures>
      | IframeRpcError<TCallerProcedures>,
  ): message is IframeRpcError<TCallerProcedures> {
    return "error" in message;
  }

  protected abstract createErrorResponse(
    method: TCalleeProcedures,
    error?: string,
  ): Omit<TCallerResponse, "id">;
}
