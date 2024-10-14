import { BlockInputType } from "../../block-input-type";
import { Block, TextPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "operator_contains";

export interface ContainsBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    STRING1: [
      BlockInputType,
      TextPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
    STRING2: [
      BlockInputType,
      TextPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
  };
}

export const isContainsBlock = (block: Block): block is ContainsBlock =>
  block.opcode === opcode;
