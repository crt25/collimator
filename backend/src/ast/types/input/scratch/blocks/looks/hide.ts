import { Block } from "../../generated/sb3";

const opcode = "looks_hide";

export interface HideBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
}

export const isHideBlock = (block: Block): block is HideBlock =>
  block.opcode === opcode;
