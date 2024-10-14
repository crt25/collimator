import { Block } from "../../generated/sb3";

const opcode = "data_lengthoflist";

export interface LengthOfListBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
  fields: {
    LIST: [string, string];
  };
}

export const isLengthOfListBlock = (block: Block): block is LengthOfListBlock =>
  block.opcode === opcode;
