import { Block } from "../../generated/sb3";

const opcode = "data_showlist";

export interface ShowListBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
  fields: {
    LIST: [string, string];
  };
}

export const isShowListBlock = (block: Block): block is ShowListBlock =>
  block.opcode === opcode;
