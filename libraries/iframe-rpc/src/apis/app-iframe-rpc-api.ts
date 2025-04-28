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
  protected override createErrorResponse(
    method: IframeRpcPlatformMethods,
    error?: string,
  ): Omit<IframeRpcApplicationResponse, "id"> {
    const response: Omit<IframeRpcError<IframeRpcPlatformMethods>, "id"> = {
      jsonrpc: "2.0",
      method: method,
      error,
    };

    return response;
  }
}
