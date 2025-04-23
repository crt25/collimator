import { RemoteProcedureCall } from "../remote-procedure-call";
import { RemoteProcedureCallCaller } from "../remote-procedure-caller";
import { Submission } from "./get-submission";

export type Task = {
  file: Blob;
  initialSolution: Submission;
};

export type GetTask = RemoteProcedureCall<{
  procedure: "getTask";

  caller: RemoteProcedureCallCaller.Platform;
  arguments: undefined;
  result: Task;
}>;
