import { Block } from "../../generated/sb3";

const opcode = "control_stop";

export interface StopBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
  fields: {
    STOP_OPTION: [string, null];
  };
}

export const isStopBlock = (block: Block): block is StopBlock =>
  block.opcode === opcode;
