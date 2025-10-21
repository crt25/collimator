import { IframeRpcMethod } from "../remote-procedure-call";
import { RpcCaller } from "../rpc-caller";

export type PostStudentAppActivity = IframeRpcMethod<{
  method: "postStudentAppActivity";
  caller: RpcCaller.App;
  parameters: {
    action: string;
    data: unknown;
    solution: Blob;
  };
  result: undefined;
}>;
