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

export type PlatformHandleRequestMap = HandleRequestMap<
  IframeRpcApplicationMethods,
  IframeRpcApplicationRequest,
  IframeRpcPlatformResponse
>;

export class PlatformIframeRpcApi extends IframeRpcApi<
  IframeRpcPlatformMethods,
  IframeRpcApplicationMethods,
  IframeRpcPlatformRequest,
  IframeRpcApplicationRequest,
  IframeRpcPlatformResponse,
  IframeRpcApplicationResponse
> {
  protected override createRequest<Method extends IframeRpcPlatformMethods>(
    id: number,
    method: Method,
    parameters: ParametersOf<IframeRpcPlatformRequest & { method: Method }>,
  ): IframeRpcPlatformRequest & { method: Method } {
    return {
      jsonrpc: "2.0",
      id,
      method,
      parameters,
      // unfortunately typescript is not capable of performing the inference directly
    } as IframeRpcPlatformRequest & { method: Method };
  }

  protected override createResponse<Method extends IframeRpcApplicationMethods>(
    id: number,
    method: Method,
    result: ResultOf<IframeRpcPlatformResponse & { method: Method }>,
  ): IframeRpcPlatformResponse & { method: Method } {
    return {
      jsonrpc: "2.0",
      id,
      method,
      result,
    };
  }

  protected override createErrorResponse(
    id: number,
    method: IframeRpcApplicationMethods,
    error?: string,
  ): IframeRpcError<IframeRpcApplicationMethods> {
    return {
      jsonrpc: "2.0",
      id,
      method,
      error,
    };
  }
}
