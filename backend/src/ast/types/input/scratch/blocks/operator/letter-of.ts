import { BlockInputType } from "../../block-input-type";
import {
  Block,
  NumPrimitive,
  TextPrimitive,
  VariablePrimitive,
} from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "operator_letter_of";

export interface LetterOfBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    LETTER: [
      BlockInputType,
      NumPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
    STRING: [
      BlockInputType,
      TextPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
  };
}

export const isLetterOfBlock = (block: Block): block is LetterOfBlock =>
  block.opcode === opcode;
