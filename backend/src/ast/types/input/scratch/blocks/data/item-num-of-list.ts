import { BlockInputType } from "../../block-input-type";
import { Block, TextPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "data_itemnumoflist";

export interface ItemNumOfListBlock extends Block {
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

export const isItemNumOfListBlock = (
  block: Block,
): block is ItemNumOfListBlock => block.opcode === opcode;
