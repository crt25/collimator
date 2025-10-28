import { IframeRpcMethod } from "../remote-procedure-call";
import { RpcCaller } from "../rpc-caller";

export interface ExportTaskResult {
  file: Blob;
  filename: string;
}

export type ExportTask = IframeRpcMethod<{
  method: "exportTask";
  caller: RpcCaller.CrtPlatform;
  parameters: undefined;
  result: ExportTaskResult;
}>;
