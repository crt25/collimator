import { IframeRpcMethod } from "../remote-procedure-call";
import { RpcCaller } from "../rpc-caller";
import { Submission } from "./get-submission";

export type PostSubmission = IframeRpcMethod<{
  method: "postSubmission";
  caller: RpcCaller.App;
  parameters: Submission;
  result: undefined;
}>;
