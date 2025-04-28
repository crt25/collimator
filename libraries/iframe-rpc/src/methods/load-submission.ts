import { IframeRpcMethod } from "../remote-procedure-call";
import { RemoteProcedureCallCaller } from "../remote-procedure-caller";
import { Language } from "../languages";

export type LoadSubmission = IframeRpcMethod<{
  method: "loadSubmission";
  caller: RemoteProcedureCallCaller.Platform;
  parameters: {
    task: Blob;
    submission: Blob;
    subTaskId?: string;
    language: Language;
  };
  result: undefined;
}>;
