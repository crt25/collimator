import { IframeRpcMethod } from "../remote-procedure-call";
import { RpcCaller } from "../rpc-caller";
import { Language } from "../languages";

interface LoadTaskParamsBase {
  language: Language;
}

export interface LoadTaskParamsWithTask extends LoadTaskParamsBase {
  task: Blob;
}

export interface LoadTaskParamsWithoutTask extends LoadTaskParamsBase {
  useDefaultTask: true;
}

export type LoadTask = IframeRpcMethod<{
  method: "loadTask";
  caller: RpcCaller.CrtPlatform;
  parameters: LoadTaskParamsWithTask | LoadTaskParamsWithoutTask;
  result: undefined;
}>;

export const isLoadTaskWithTask = (
  params: LoadTaskParamsWithTask | LoadTaskParamsWithoutTask,
): params is LoadTaskParamsWithTask => "task" in params;
