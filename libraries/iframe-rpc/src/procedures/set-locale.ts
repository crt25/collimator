import { RemoteProcedureCall } from "../remote-procedure-call";
import { RemoteProcedureCallCaller } from "../remote-procedure-caller";
import { Language } from "../languages";

export type SetLocale = RemoteProcedureCall<{
  procedure: "setLocale";
  caller: RemoteProcedureCallCaller.Platform;
  arguments: Language;
  result: undefined;
}>;
