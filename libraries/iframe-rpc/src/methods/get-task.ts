import { IframeRpcMethod } from "../remote-procedure-call";
import { RemoteProcedureCallCaller } from "../remote-procedure-caller";
import { Submission } from "./get-submission";

export type Task = {
  file: Blob;
  initialSolution: Submission;
};

export type GetTask = IframeRpcMethod<{
  method: "getTask";

  caller: RemoteProcedureCallCaller.Platform;
  parameters: undefined;
  result: Task;
}>;
