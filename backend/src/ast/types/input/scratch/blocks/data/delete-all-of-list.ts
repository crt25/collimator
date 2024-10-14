import { Block } from "../../generated/sb3";

const opcode = "data_deletealloflist";

export interface DeleteAllOfListBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
  fields: {
    LIST: [string, string];
  };
}

export const isDeleteAllOfListBlock = (
  block: Block,
): block is DeleteAllOfListBlock => block.opcode === opcode;
