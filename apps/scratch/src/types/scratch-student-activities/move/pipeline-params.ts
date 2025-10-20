import { Block } from "scratch-blocks";
import { BasePipelineParams, StudentAction } from "../common";

export interface MovePipelineParams extends BasePipelineParams {
  action: StudentAction.Move;
  block: Block;
}
