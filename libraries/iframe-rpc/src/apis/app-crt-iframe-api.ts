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

export type AppHandleRequestMap = HandleRequestMap<
  AppIFramePlatformProcedures,
  AppIFramePlatformRequest,
  AppIFrameApplicationResponse
>;

export class AppCrtIframeApi extends CrtIframeApi<
  AppIFrameApplicationProcedures,
  AppIFramePlatformProcedures,
  AppIFrameApplicationRequest,
  AppIFramePlatformRequest,
  AppIFrameApplicationResponse,
  AppIFramePlatformResponse
> {
  protected override createErrorResponse(
    method: AppIFramePlatformProcedures,
    error?: string,
  ): Omit<AppIFrameApplicationResponse, "id"> {
    const response: Omit<
      RemoteProcedureCallResponseErrorMessage<AppIFramePlatformProcedures>,
      "id"
    > = {
      jsonrpc: "2.0",
      method: method,
      error,
    };

    return response;
  }
}
