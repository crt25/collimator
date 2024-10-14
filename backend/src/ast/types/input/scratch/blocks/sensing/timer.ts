import { Block } from "../../generated/sb3";

const opcode = "sensing_timer";

export interface TimerBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
  fields: Record<string, never>;
}

export const isTimerBlock = (block: Block): block is TimerBlock =>
  block.opcode === opcode;
