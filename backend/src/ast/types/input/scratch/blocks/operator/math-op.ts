import { BlockInputType } from "../../block-input-type";
import { Block, NumPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "operator_mathop";

export interface MathOpBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    NUM: [
      BlockInputType,
      NumPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
  };
  fields: {
    OPERATOR: [string, null];
  };
}

export const isMathOpBlock = (block: Block): block is MathOpBlock =>
  block.opcode === opcode;
