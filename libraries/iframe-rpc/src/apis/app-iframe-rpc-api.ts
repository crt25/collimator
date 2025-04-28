import {
  IframeRpcApplicationMethods,
  IframeRpcApplicationRequest,
  IframeRpcApplicationResponse,
  IframeRpcPlatformMethods,
  IframeRpcPlatformRequest,
  IframeRpcPlatformResponse,
} from "../methods";
import { IframeRpcError } from "../remote-procedure-call";
import { ParametersOf, ResultOf } from "../utils";
import { IframeRpcApi, HandleRequestMap } from "./iframe-rpc-api";

export type AppHandleRequestMap = HandleRequestMap<
  IframeRpcPlatformMethods,
  IframeRpcPlatformRequest,
  IframeRpcApplicationResponse
>;

export class AppIframeRpcApi extends IframeRpcApi<
  IframeRpcApplicationMethods,
  IframeRpcPlatformMethods,
  IframeRpcApplicationRequest,
  IframeRpcPlatformRequest,
  IframeRpcApplicationResponse,
  IframeRpcPlatformResponse
> {
  protected override createRequest<Method extends IframeRpcApplicationMethods>(
    id: number,
    method: Method,
    parameters: ParametersOf<IframeRpcApplicationRequest & { method: Method }>,
  ): IframeRpcApplicationRequest & { method: Method } {
    return {
      jsonrpc: "2.0",
      id,
      method,
      parameters,
      // unfortunately typescript is not capable of performing the inference directly
    } as IframeRpcApplicationRequest & { method: Method };
  }

  protected override createResponse<Method extends IframeRpcPlatformMethods>(
    id: number,
    method: Method,
    result: ResultOf<IframeRpcApplicationResponse & { method: Method }>,
  ): IframeRpcApplicationResponse & { method: Method } {
    return {
      jsonrpc: "2.0",
      id,
      method,
      result,
      // unfortunately typescript is not capable of performing the inference directly
    } as IframeRpcApplicationResponse & { method: Method };
  }

  protected override createErrorResponse(
    id: number,
    method: IframeRpcPlatformMethods,
    error?: string,
  ): IframeRpcError<IframeRpcPlatformMethods> {
    return {
      jsonrpc: "2.0",
      id,
      method,
      error,
    };
  }
}
