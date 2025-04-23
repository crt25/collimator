import {
  RemoteProcedureCallProcedure,
  RemoteProcedureCallRequest,
  RemoteProcedureCallResponse,
} from "../remote-procedure-call";
import { RemoteProcedureCallCaller } from "../remote-procedure-caller";
import { GetHeight } from "./get-height";
import { GetSubmission } from "./get-submission";
import { GetTask } from "./get-task";
import { LoadSubmission } from "./load-submission";
import { LoadTask } from "./load-task";
import { PostSubmission } from "./post-submission";
import { SetLocale } from "./set-locale";

export type { Submission, Test } from "./get-submission";
export type { Task } from "./get-task";

type Procedures =
  | GetHeight
  | GetSubmission
  | GetTask
  | LoadSubmission
  | LoadTask
  | SetLocale
  | PostSubmission;

type AppIFrameMessageWithCaller<Caller extends RemoteProcedureCallCaller> =
  Procedures & {
    caller: Caller;
  };

export type AppIFramePlatformProcedures = RemoteProcedureCallProcedure<
  AppIFrameMessageWithCaller<RemoteProcedureCallCaller.Platform>
>;

export type AppIFrameApplicationProcedures = RemoteProcedureCallProcedure<
  AppIFrameMessageWithCaller<RemoteProcedureCallCaller.Application>
>;

export type AppIFramePlatformRequest = RemoteProcedureCallRequest<
  AppIFrameMessageWithCaller<RemoteProcedureCallCaller.Platform>
>;

export type AppIFrameApplicationRequest = RemoteProcedureCallRequest<
  AppIFrameMessageWithCaller<RemoteProcedureCallCaller.Application>
>;

export type AppIFrameApplicationResponse = RemoteProcedureCallResponse<
  AppIFrameMessageWithCaller<RemoteProcedureCallCaller.Platform>
>;

export type AppIFramePlatformResponse = RemoteProcedureCallResponse<
  AppIFrameMessageWithCaller<RemoteProcedureCallCaller.Application>
>;

export type AppIFramePlatformMessage =
  | AppIFramePlatformRequest
  | AppIFramePlatformResponse;

export type AppIFrameApplicationMessage =
  | AppIFrameApplicationRequest
  | AppIFrameApplicationResponse;
