import { IframeRpcMethod } from "../remote-procedure-call";
import { RpcCaller } from "../rpc-caller";
import { Language } from "../languages";

export type SetLocale = IframeRpcMethod<{
  method: "setLocale";
  caller: RpcCaller.CrtPlatform;
  parameters: Language;
  result: undefined;
}>;
