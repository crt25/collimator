import { BlockInputType } from "../../block-input-type";
import { Block, TextPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "data_listcontainsitem";

export interface ListContainsItemBlock extends Block {
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

export const isListContainsItemBlock = (
  block: Block,
): block is ListContainsItemBlock => block.opcode === opcode;
