import { IframeRpcMethod } from "../remote-procedure-call";
import { RpcCaller } from "../rpc-caller";

export type PostStudentActivity = IframeRpcMethod<{
  method: "postStudentActivity";
  caller: RpcCaller.App;
  parameters: {
    action: string;
    data: Record<string, unknown>;
    solution: Blob;
  };
  result: undefined;
}>;
