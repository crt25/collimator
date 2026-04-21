import { IframeRpcMethod } from "../remote-procedure-call";
import { RpcCaller } from "../rpc-caller";

export enum ToastType {
  Success = "success",
  Error = "error",
  Info = "info",
}

export type PostMessage = IframeRpcMethod<{
  method: "postMessage";
  caller: RpcCaller.App;
  parameters: {
    title: string;
    message: string;
    type: ToastType;
  };
  result: undefined;
}>;
