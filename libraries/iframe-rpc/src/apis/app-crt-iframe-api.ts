import {
  AppIFrameApplicationProcedures,
  AppIFrameApplicationRequest,
  AppIFrameApplicationResponse,
  AppIFramePlatformProcedures,
  AppIFramePlatformRequest,
  AppIFramePlatformResponse,
} from "../procedures";
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
    procedure: AppIFramePlatformProcedures,
    error?: string,
  ): Omit<AppIFrameApplicationResponse, "id" | "type"> {
    const response: Omit<
      RemoteProcedureCallResponseErrorMessage<AppIFramePlatformProcedures>,
      "id" | "type"
    > = {
      procedure,
      error,
    };

    return response;
  }
}
