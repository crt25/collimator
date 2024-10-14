import { BlockInputType } from "../../block-input-type";
import { Block, NumPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "operator_lt";

export interface LtBlock extends Block {
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

export const isLtBlock = (block: Block): block is LtBlock =>
  block.opcode === opcode;
