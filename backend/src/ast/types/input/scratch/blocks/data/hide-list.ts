import { Block } from "../../generated/sb3";

const opcode = "data_hidelist";

export interface HideListBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
  fields: {
    LIST: [string, string];
  };
}

export const isHideListBlock = (block: Block): block is HideListBlock =>
  block.opcode === opcode;
