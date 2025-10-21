import { BasePipelineParams, StudentActionType } from "../common";
import { DeletedBlockRecord } from "./types";

export interface DeletePipelineParams extends BasePipelineParams {
  action: StudentActionType.Delete;
  block: DeletedBlockRecord;
}
