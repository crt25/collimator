import { Block } from "../../generated/sb3";

const opcode = "looks_backdrops";

export interface BackdropsBlock extends Block {
  opcode: typeof opcode;
  fields: {
    BACKDROP: [string | null];
  };
}

export const isBackdropsBlock = (block: Block): block is BackdropsBlock =>
  block.opcode === opcode;
