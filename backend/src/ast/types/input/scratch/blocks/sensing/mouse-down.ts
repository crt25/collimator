import { Block } from "../../generated/sb3";

const opcode = "sensing_mousedown";

export interface MouseDownBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
  fields: Record<string, never>;
}

export const isMouseDownBlock = (block: Block): block is MouseDownBlock =>
  block.opcode === opcode;
