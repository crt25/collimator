import { RemoteProcedureCall } from "../remote-procedure-call";
import { RemoteProcedureCallCaller } from "../remote-procedure-caller";
import { Language } from "../languages";

export type SetLocale = RemoteProcedureCall<{
  method: "setLocale";
  caller: RemoteProcedureCallCaller.Platform;
  parameters: Language;
  result: undefined;
}>;
