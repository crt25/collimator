import { Block } from "../../generated/sb3";

const opcode = "looks_nextbackdrop";

export interface NextBackdropBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
}

export const isNextBackdropBlock = (block: Block): block is NextBackdropBlock =>
  block.opcode === opcode;
