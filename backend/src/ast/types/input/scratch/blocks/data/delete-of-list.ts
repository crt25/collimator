import { BlockInputType } from "../../block-input-type";
import { Block, NumPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "data_deleteoflist";

export interface DeleteOfListBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    INDEX: [
      BlockInputType,
      NumPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
  };
  fields: {
    LIST: [string, string];
  };
}

export const isDeleteOfListBlock = (block: Block): block is DeleteOfListBlock =>
  block.opcode === opcode;
