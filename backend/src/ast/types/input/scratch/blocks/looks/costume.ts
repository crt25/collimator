import { Block } from "../../generated/sb3";

const opcode = "looks_costume";

export interface CostumeBlock extends Block {
  opcode: typeof opcode;
  fields: {
    COSTUME: [string | null];
  };
}

export const isCostumeBlock = (block: Block): block is CostumeBlock =>
  block.opcode === opcode;
