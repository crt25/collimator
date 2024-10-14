import { BlockInputType } from "../../block-input-type";
import {
  Block,
  NumPrimitive,
  TextPrimitive,
  VariablePrimitive,
} from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "data_replaceitemoflist";

export interface ReplaceItemOfListBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    INDEX: [
      BlockInputType,
      NumPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
    ITEM: [
      BlockInputType,
      TextPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
  };
  fields: {
    LIST: [string, string];
  };
}

export const isReplaceItemOfListBlock = (
  block: Block,
): block is ReplaceItemOfListBlock => block.opcode === opcode;
