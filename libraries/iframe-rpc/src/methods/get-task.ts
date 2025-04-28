import { IframeRpcMethod } from "../remote-procedure-call";
import { RpcCaller } from "../rpc-caller";
import { Submission } from "./get-submission";

export type Task = {
  file: Blob;
  initialSolution: Submission;
};

export type GetTask = IframeRpcMethod<{
  method: "getTask";

  caller: RpcCaller.Platform;
  parameters: undefined;
  result: Task;
}>;
