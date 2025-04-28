import { RemoteProcedureCallCaller } from "../remote-procedure-caller";
import { MethodOf, RequestOf, ResponseOf } from "../utils";
import { GetHeight } from "./get-height";
import { GetSubmission } from "./get-submission";
import { GetTask } from "./get-task";
import { LoadSubmission } from "./load-submission";
import { LoadTask } from "./load-task";
import { PostSubmission } from "./post-submission";
import { SetLocale } from "./set-locale";

export type { Submission, Test } from "./get-submission";
export type { Task } from "./get-task";

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
