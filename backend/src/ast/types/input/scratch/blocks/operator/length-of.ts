import { BlockInputType } from "../../block-input-type";
import { Block, TextPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "operator_length";

export interface LengthOfBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    STRING: [
      BlockInputType,
      TextPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
  };
}

export const isLengthOfBlock = (block: Block): block is LengthOfBlock =>
  block.opcode === opcode;
