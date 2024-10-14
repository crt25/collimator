import { BlockInputType } from "../../block-input-type";
import { Block, NumPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "data_itemoflist";

export interface ItemOfListBlock extends Block {
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

export const isItemOfListBlock = (block: Block): block is ItemOfListBlock =>
  block.opcode === opcode;
