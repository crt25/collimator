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
    procedure: AppIFrameApplicationProcedures,
    error?: string,
  ): Omit<AppIFramePlatformResponse, "id" | "type"> {
    const response: Omit<
      RemoteProcedureCallResponseErrorMessage<AppIFrameApplicationProcedures>,
      "id" | "type"
    > = {
      procedure,
      error,
    };

    return response;
  }
}
