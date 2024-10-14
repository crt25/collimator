import { BlockInputType } from "../../block-input-type";
import { Block, TextPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "data_addtolist";

export interface AddToListBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    ITEM: [
      BlockInputType,
      TextPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
  };
  fields: {
    LIST: [string, string];
  };
}

export const isAddToListBlock = (block: Block): block is AddToListBlock =>
  block.opcode === opcode;
