import { IframeRpcMethod } from "../remote-procedure-call";
import { RpcCaller } from "../rpc-caller";

type Action = "create" | "move" | "delete";

export type PostStudentActivity = IframeRpcMethod<{
  method: "postStudentActivity";
  caller: RpcCaller.App;
  parameters: {
    action: Action;
    data: Record<string, unknown>;
    solution: Blob;
    type: string;
  };
  result: undefined;
}>;
