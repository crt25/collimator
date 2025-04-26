import {
  RemoteProcedureCallRequestMessageBase,
  RemoteProcedureCallResponseErrorMessage,
  RemoteProcedureCallResponseMessageBase,
} from "../remote-procedure-call";

const MAX_COUNTER = 1000000;

export type IframeApiResponse<Procedure extends string, TResponse> = Omit<
  TResponse & { procedure: Procedure },
  "id" | "type"
>;

type HandleRequest<Procedure extends string, TRequest, TResponse> = (
  request: TRequest & { procedure: Procedure },
  event: MessageEvent,
) => Promise<IframeApiResponse<Procedure, TResponse>>;

export type HandleRequestMap<Procedures extends string, TRequest, TResponse> = {
  [Procedure in Procedures]: HandleRequest<Procedure, TRequest, TResponse>;
};

export type MessageTarget = Window | MessagePort | ServiceWorker;

export abstract class CrtIframeApi<
  TCallerProcedures extends string,
  TCalleeProcedures extends string,
  TCallerRequest extends
    RemoteProcedureCallRequestMessageBase<TCallerProcedures>,
  TCalleeRequest extends
    RemoteProcedureCallRequestMessageBase<TCalleeProcedures>,
  TCallerResponse extends
    | RemoteProcedureCallResponseMessageBase<TCalleeProcedures>
    | RemoteProcedureCallResponseErrorMessage<TCalleeProcedures>,
  TCalleeResponse extends
    | RemoteProcedureCallResponseMessageBase<TCallerProcedures>
    | RemoteProcedureCallResponseErrorMessage<TCallerProcedures>,
> {
  private readonly pendingRequests: {
    [key: number]: {
      resolve: (response: TCalleeResponse & { type: "response" }) => void;
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
    message: Omit<TCallerResponse, "id" | "type">,
    isError = false,
  ): void {
    if (!event.source) {
      console.error("Cannot respond to event without source:", event);
      return;
    }

    return this.sendMessage(
      event.source,
      {
        id: (event.data as TCalleeRequest).id,
        type: isError ? "error" : "response",
        ...message,
        // unfortunately typescript cannot infer the type here but it is
        // easy to check manually that id and type are now set.
      } as TCallerResponse,
      event.origin,
    );
  }

  sendRequest<ProcedureName extends TCallerProcedures>(
    request: Omit<TCallerRequest, "id" | "type"> & {
      procedure: ProcedureName;
    },
  ): Promise<TCalleeResponse & { type: "response"; procedure: ProcedureName }> {
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
        resolve: (response: TCalleeResponse & { type: "response" }): void => {
          if (response.procedure !== request.procedure) {
            console.error("Invalid response procedure", response, request);
            return;
          }

          resolve(
            response as TCalleeResponse & {
              type: "response";
              procedure: ProcedureName;
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
          type: "request",
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
          response as TCalleeResponse & {
            type: "response";
          },
        );
      }
      // remove the resolve function from the pendingRequests object
      delete this.pendingRequests[message.id];

      return;
    }

    const request: TCalleeRequest = message;
    const handleRequest = this.onRequest[request.procedure];

    console.debug("Received IframeRPC request", request);

    try {
      const response = await handleRequest(message, event);
      this.respondToRequest(event, response);
    } catch (e) {
      console.error("Error handling request", e, message);

      this.respondToRequest(
        event,
        this.createErrorResponse(
          request.procedure,
          e instanceof Error ? e.message : "Unkown error",
        ),
        true,
      );
    }
  }

  private isResponse(
    message: TCalleeRequest | TCalleeResponse,
  ): message is TCalleeResponse {
    return message.type === "response" || message.type === "error";
  }

  private isErrorResponse(
    message:
      | RemoteProcedureCallResponseMessageBase<TCallerProcedures>
      | RemoteProcedureCallResponseErrorMessage<TCallerProcedures>,
  ): message is RemoteProcedureCallResponseErrorMessage<TCallerProcedures> {
    return message.type === "error";
  }

  protected abstract createErrorResponse(
    procedure: TCalleeProcedures,
    error?: string,
  ): Omit<TCallerResponse, "id" | "type">;
}
