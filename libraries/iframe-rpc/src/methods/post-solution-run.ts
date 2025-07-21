import { IframeRpcMethod } from "../remote-procedure-call";
import { RpcCaller } from "../rpc-caller";

type Solution = Blob;

export type PostSolutionRun = IframeRpcMethod<{
  method: "postSolutionRun";
  caller: RpcCaller.App;
  parameters: Solution;
  result: undefined;
}>;
