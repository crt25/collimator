import { Block } from "../../generated/sb3";

const opcode = "sensing_resettimer";

export interface ResetTimerBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
  fields: Record<string, never>;
}

export const isResetTimerBlock = (block: Block): block is ResetTimerBlock =>
  block.opcode === opcode;
