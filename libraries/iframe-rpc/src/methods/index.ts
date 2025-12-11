import { RpcCaller } from "../rpc-caller";
import { MethodOf, RequestOf, ResponseOf } from "../utils";
import { GetHeight } from "./get-height";
import { GetSubmission } from "./get-submission";
import { GetTask } from "./get-task";
import { ImportTask } from "./import-task";
import { LoadSubmission } from "./load-submission";
import { LoadTask } from "./load-task";
import { PostSolutionRun } from "./post-solution-run";
import { PostSubmission } from "./post-submission";
import { SetLocale } from "./set-locale";
import { PostStudentAppActivity } from "./post-student-activity";
import { ExportTask } from "./export-task";

export type { GetHeight } from "./get-height";
export type { GetSubmission, Submission, Test } from "./get-submission";
export type { GetTask, Task } from "./get-task";
export type { LoadSubmission } from "./load-submission";
export type { LoadTask } from "./load-task";
export type { PostSubmission } from "./post-submission";
export type { SetLocale } from "./set-locale";
export type { ImportTask } from "./import-task";
export type { PostStudentAppActivity } from "./post-student-activity";

type Methods =
  | GetHeight
  | GetSubmission
  | GetTask
  | LoadSubmission
  | LoadTask
  | SetLocale
  | ExportTask
  | PostSubmission
  | ImportTask
  | PostStudentAppActivity
  | PostSolutionRun;

type IframeRpcDefinitionForCaller<Caller extends RpcCaller> = Methods & {
  caller: Caller;
};

export type IframeRpcPlatformMethods = MethodOf<
  IframeRpcDefinitionForCaller<RpcCaller.CrtPlatform>
>;

export type IframeRpcApplicationMethods = MethodOf<
  IframeRpcDefinitionForCaller<RpcCaller.App>
>;

export type IframeRpcPlatformRequest = RequestOf<
  IframeRpcDefinitionForCaller<RpcCaller.CrtPlatform>
>;

export type IframeRpcApplicationRequest = RequestOf<
  IframeRpcDefinitionForCaller<RpcCaller.App>
>;

export type IframeRpcApplicationResponse = ResponseOf<
  IframeRpcDefinitionForCaller<RpcCaller.CrtPlatform>
>;

export type IframeRpcPlatformResponse = ResponseOf<
  IframeRpcDefinitionForCaller<RpcCaller.App>
>;

export type IframeRpcPlatformMessage =
  | IframeRpcPlatformRequest
  | IframeRpcPlatformResponse;

export type IframeRpcApplicationMessage =
  | IframeRpcApplicationRequest
  | IframeRpcApplicationResponse;
