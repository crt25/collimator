import { RemoteProcedureCall } from "../remote-procedure-call";
import { RemoteProcedureCallCaller } from "../remote-procedure-caller";
import { Language } from "../languages";

export type LoadTask = RemoteProcedureCall<{
  method: "loadTask";
  caller: RemoteProcedureCallCaller.Platform;
  parameters: {
    task: Blob;
    language: Language;
  };
  result: undefined;
}>;
