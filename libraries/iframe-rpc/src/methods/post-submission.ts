import { IframeRpcMethod } from "../remote-procedure-call";
import { RemoteProcedureCallCaller } from "../remote-procedure-caller";
import { Submission } from "./get-submission";

export type PostSubmission = IframeRpcMethod<{
  method: "postSubmission";
  caller: RemoteProcedureCallCaller.Application;
  parameters: Submission;
  result: undefined;
}>;
