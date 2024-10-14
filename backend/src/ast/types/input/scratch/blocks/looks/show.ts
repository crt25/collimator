import { Block } from "../../generated/sb3";

const opcode = "looks_show";

export interface ShowBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
}

export const isShowBlock = (block: Block): block is ShowBlock =>
  block.opcode === opcode;
