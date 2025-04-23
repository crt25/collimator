import { RemoteProcedureCall } from "../remote-procedure-call";
import { RemoteProcedureCallCaller } from "../remote-procedure-caller";
import { Language } from "../languages";

export type LoadTask = RemoteProcedureCall<{
  procedure: "loadTask";
  caller: RemoteProcedureCallCaller.Platform;
  arguments: {
    task: Blob;
    language: Language;
  };
  result: undefined;
}>;
