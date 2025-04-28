import {
  IframeRpcApplicationMethods,
  IframeRpcApplicationRequest,
  IframeRpcApplicationResponse,
  IframeRpcPlatformMethods,
  IframeRpcPlatformRequest,
  IframeRpcPlatformResponse,
} from "../methods";
import { IframeRpcError } from "../remote-procedure-call";
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
  protected override createErrorResponse(
    method: IframeRpcApplicationMethods,
    error?: string,
  ): Omit<IframeRpcPlatformResponse, "id"> {
    const response: Omit<IframeRpcError<IframeRpcApplicationMethods>, "id"> = {
      jsonrpc: "2.0",
      method: method,
      error,
    };

    return response;
  }
}
