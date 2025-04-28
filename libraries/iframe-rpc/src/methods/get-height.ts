import { IframeRpcMethod } from "../remote-procedure-call";
import { RpcCaller } from "../rpc-caller";

export type GetHeight = IframeRpcMethod<{
  method: "getHeight";
  caller: RpcCaller.CrtPlatform;
  parameters: undefined;
  result: number;
}>;
