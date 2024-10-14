import { Block } from "../../generated/sb3";

const opcode = "sensing_mousex";

export interface MouseXBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
  fields: Record<string, never>;
}

export const isMouseXBlock = (block: Block): block is MouseXBlock =>
  block.opcode === opcode;
