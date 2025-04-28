import { RemoteProcedureCall } from "../remote-procedure-call";
import { RemoteProcedureCallCaller } from "../remote-procedure-caller";

export type GetHeight = RemoteProcedureCall<{
  procedure: "getHeight";
  caller: RemoteProcedureCallCaller.Platform;
  arguments: undefined;
  result: number;
}>;
