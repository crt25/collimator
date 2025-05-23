import { IframeRpcMethod } from "../remote-procedure-call";
import { RpcCaller } from "../rpc-caller";
import { Language } from "../languages";

export type LoadTask = IframeRpcMethod<{
  method: "loadTask";
  caller: RpcCaller.CrtPlatform;
  parameters: {
    task: Blob;
    language: Language;
  };
  result: undefined;
}>;
