import { IframeRpcMethod } from "../remote-procedure-call";
import { RpcCaller } from "../rpc-caller";

export type PostTaskSolution = IframeRpcMethod<{
  method: "postTaskSolution";
  caller: RpcCaller.App;
  parameters: {
    solution: Blob;
  };
  result: undefined;
}>;
