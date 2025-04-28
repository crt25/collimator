import { RemoteProcedureCall } from "../remote-procedure-call";
import { RemoteProcedureCallCaller } from "../remote-procedure-caller";
import { Language } from "../languages";

export type LoadSubmission = RemoteProcedureCall<{
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
