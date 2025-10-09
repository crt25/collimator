import { IframeRpcApplicationMessage, IframeRpcPlatformMessage } from ".";

export type RpcMethodName =
  | IframeRpcPlatformMessage["method"]
  | IframeRpcApplicationMessage["method"];
