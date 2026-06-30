import { IframeRpcMethod } from "../remote-procedure-call";
import { RpcCaller } from "../rpc-caller";

export const SCRATCH_TASK_EXPORT_FILENAME =
  "ClassMosaicExportedScratchTask.sb3";
export const JUPYTER_TASK_EXPORT_FILENAME =
  "ClassMosaicExportedJupyterTask.zip";

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
