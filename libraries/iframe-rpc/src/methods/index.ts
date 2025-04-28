import { RemoteProcedureCallCaller } from "../remote-procedure-caller";
import { MethodOf, RequestOf, ResponseOf } from "../utils";
import { GetHeight } from "./get-height";
import { GetSubmission } from "./get-submission";
import { GetTask } from "./get-task";
import { LoadSubmission } from "./load-submission";
import { LoadTask } from "./load-task";
import { PostSubmission } from "./post-submission";
import { SetLocale } from "./set-locale";

export type { GetHeight } from "./get-height";
export type { GetSubmission, Submission, Test } from "./get-submission";
export type { GetTask, Task } from "./get-task";
export type { LoadSubmission } from "./load-submission";
export type { LoadTask } from "./load-task";
export type { PostSubmission } from "./post-submission";
export type { SetLocale } from "./set-locale";

type Methods =
  | GetHeight
  | GetSubmission
  | GetTask
  | LoadSubmission
  | LoadTask
  | SetLocale
  | PostSubmission;

type IframeRpcDefinitionForCaller<Caller extends RemoteProcedureCallCaller> =
  Methods & {
    caller: Caller;
  };

export type IframeRpcPlatformMethods = MethodOf<
  IframeRpcDefinitionForCaller<RemoteProcedureCallCaller.Platform>
>;

export type IframeRpcApplicationMethods = MethodOf<
  IframeRpcDefinitionForCaller<RemoteProcedureCallCaller.Application>
>;

export type IframeRpcPlatformRequest = RequestOf<
  IframeRpcDefinitionForCaller<RemoteProcedureCallCaller.Platform>
>;

export type IframeRpcApplicationRequest = RequestOf<
  IframeRpcDefinitionForCaller<RemoteProcedureCallCaller.Application>
>;

export type IframeRpcApplicationResponse = ResponseOf<
  IframeRpcDefinitionForCaller<RemoteProcedureCallCaller.Platform>
>;

export type IframeRpcPlatformResponse = ResponseOf<
  IframeRpcDefinitionForCaller<RemoteProcedureCallCaller.Application>
>;

export type IframeRpcPlatformMessage =
  | IframeRpcPlatformRequest
  | IframeRpcPlatformResponse;

export type IframeRpcApplicationMessage =
  | IframeRpcApplicationRequest
  | IframeRpcApplicationResponse;
