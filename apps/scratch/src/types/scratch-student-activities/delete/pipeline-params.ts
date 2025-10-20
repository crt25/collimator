import { BasePipelineParams, StudentAction } from "../common";
import { DeletedBlockRecord } from "../../../utilities/scratch-block";

export interface DeletePipelineParams extends BasePipelineParams {
  action: StudentAction.Delete;
  block: DeletedBlockRecord;
}
