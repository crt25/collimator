import {
  AppIFrameApplicationProcedures,
  AppIFrameApplicationRequest,
  AppIFrameApplicationResponse,
  AppIFramePlatformProcedures,
  AppIFramePlatformRequest,
  AppIFramePlatformResponse,
} from "../methods";
import { RemoteProcedureCallResponseErrorMessage } from "../remote-procedure-call";
import { CrtIframeApi, HandleRequestMap } from "./crt-iframe-api";

export type PlatformHandleRequestMap = HandleRequestMap<
  AppIFrameApplicationProcedures,
  AppIFrameApplicationRequest,
  AppIFramePlatformResponse
>;

export class PlatformCrtIframeApi extends CrtIframeApi<
  AppIFramePlatformProcedures,
  AppIFrameApplicationProcedures,
  AppIFramePlatformRequest,
  AppIFrameApplicationRequest,
  AppIFramePlatformResponse,
  AppIFrameApplicationResponse
> {
  protected override createErrorResponse(
    method: AppIFrameApplicationProcedures,
    error?: string,
  ): Omit<AppIFramePlatformResponse, "id"> {
    const response: Omit<
      RemoteProcedureCallResponseErrorMessage<AppIFrameApplicationProcedures>,
      "id"
    > = {
      jsonrpc: "2.0",
      method: method,
      error,
    };

    return response;
  }
}
