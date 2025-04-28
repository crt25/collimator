import { IframeRpcMethod } from "../remote-procedure-call";
import { RpcCaller } from "../rpc-caller";
import { Language } from "../languages";

export type LoadSubmission = IframeRpcMethod<{
  method: "loadSubmission";
  caller: RpcCaller.Platform;
  parameters: {
    task: Blob;
    submission: Blob;
    subTaskId?: string;
    language: Language;
  };
  result: undefined;
}>;
