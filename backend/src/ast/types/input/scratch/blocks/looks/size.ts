import { Block } from "../../generated/sb3";

const opcode = "looks_size";

export interface SizeBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
  fields: Record<string, never>;
}

export const isSizeBlock = (block: Block): block is SizeBlock =>
  block.opcode === opcode;
