import { Block } from "scratch-blocks";
import { BasePipelineParams, StudentActionType } from "../common";

export interface MovePipelineParams extends BasePipelineParams {
  action: StudentActionType.Move;
  block: Block;
}
