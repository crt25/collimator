import { BlockInputType } from "../../block-input-type";
import { Block, NumPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "operator_random";

export interface RandomBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    FROM: [
      BlockInputType,
      NumPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
    TO: [
      BlockInputType,
      NumPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
  };
}

export const isRandomBlock = (block: Block): block is RandomBlock =>
  block.opcode === opcode;
