import { Block } from "../../generated/sb3";

const opcode = "sensing_current";

export interface CurrentBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
  fields: {
    CURRENTMENU: [string, null];
  };
}

export const isCurrentBlock = (block: Block): block is CurrentBlock =>
  block.opcode === opcode;
