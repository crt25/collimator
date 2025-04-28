import { IframeRpcDefinition } from "../remote-procedure-call";
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

type Request<Rpc> =
  Rpc extends IframeRpcDefinition<
    infer _Method,
    infer _Caller,
    infer _Parameters,
    infer _Result
  >
    ? Rpc["request"]
    : never;

type Method<Rpc> =
  Rpc extends IframeRpcDefinition<
    infer Method,
    infer _Caller,
    infer _Parameters,
    infer _Result
  >
    ? Method
    : never;

type Response<Rpc> =
  Rpc extends IframeRpcDefinition<
    infer _Method,
    infer _Caller,
    infer _Parameters,
    infer _Result
  >
    ? Rpc["response"]
    : never;

export type IframeRpcPlatformMethods = Method<
  IframeRpcDefinitionForCaller<RemoteProcedureCallCaller.Platform>
>;

export type IframeRpcApplicationMethods = Method<
  IframeRpcDefinitionForCaller<RemoteProcedureCallCaller.Application>
>;

export type IframeRpcPlatformRequest = Request<
  IframeRpcDefinitionForCaller<RemoteProcedureCallCaller.Platform>
>;

export type IframeRpcApplicationRequest = Request<
  IframeRpcDefinitionForCaller<RemoteProcedureCallCaller.Application>
>;

export type IframeRpcApplicationResponse = Response<
  IframeRpcDefinitionForCaller<RemoteProcedureCallCaller.Platform>
>;

export type IframeRpcPlatformResponse = Response<
  IframeRpcDefinitionForCaller<RemoteProcedureCallCaller.Application>
>;

export type IframeRpcPlatformMessage =
  | IframeRpcPlatformRequest
  | IframeRpcPlatformResponse;

export type IframeRpcApplicationMessage =
  | IframeRpcApplicationRequest
  | IframeRpcApplicationResponse;
