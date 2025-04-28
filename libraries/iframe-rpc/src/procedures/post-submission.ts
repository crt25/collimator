import { RemoteProcedureCall } from "../remote-procedure-call";
import { RemoteProcedureCallCaller } from "../remote-procedure-caller";
import { Submission } from "./get-submission";

export type PostSubmission = RemoteProcedureCall<{
  procedure: "postSubmission";
  caller: RemoteProcedureCallCaller.Application;
  arguments: Submission;
  result: undefined;
}>;
