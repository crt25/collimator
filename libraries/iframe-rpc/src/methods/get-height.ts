import { IframeRpcMethod } from "../remote-procedure-call";
import { RemoteProcedureCallCaller } from "../remote-procedure-caller";

export type GetHeight = IframeRpcMethod<{
  method: "getHeight";
  caller: RemoteProcedureCallCaller.Platform;
  parameters: undefined;
  result: number;
}>;
