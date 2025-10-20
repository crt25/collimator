import { Block } from "scratch-blocks";
import { BasePipelineParams, StudentAction } from "../common";

export interface CreatePipelineParams extends BasePipelineParams {
  action: StudentAction.Create;
  block: Block;
}
