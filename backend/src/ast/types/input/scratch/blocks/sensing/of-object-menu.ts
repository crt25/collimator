import { Block } from "../../generated/sb3";

const opcode = "sensing_of_object_menu";

export interface OfObjectMenuBlock extends Block {
  opcode: typeof opcode;
  fields: {
    OBJECT: [string | null];
  };
}

export const isOfObjectMenuBlock = (block: Block): block is OfObjectMenuBlock =>
  block.opcode === opcode;
