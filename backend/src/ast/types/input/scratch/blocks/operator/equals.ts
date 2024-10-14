import { BlockInputType } from "../../block-input-type";
import { Block, NumPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "operator_equals";

export interface EqualsBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    OPERAND1: [
      BlockInputType,
      NumPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
    OPERAND2: [
      BlockInputType,
      NumPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
  };
}

export const isEqualsBlock = (block: Block): block is EqualsBlock =>
  block.opcode === opcode;
