import { Block } from "../../generated/sb3";

const opcode = "sensing_mousey";

export interface MouseYBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
  fields: Record<string, never>;
}

export const isMouseYBlock = (block: Block): block is MouseYBlock =>
  block.opcode === opcode;
