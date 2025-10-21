import { Block } from "scratch-blocks";
import { BasePipelineParams, StudentActionType } from "../common";

export interface CreatePipelineParams extends BasePipelineParams {
  action: StudentActionType.Create;
  block: Block;
}
