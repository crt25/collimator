import { BlockInputType } from "../../block-input-type";
import { Block } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "operator_or";

export interface OrBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    OPERAND1: [BlockInputType, BlockReferenceInput];
    OPERAND2: [BlockInputType, BlockReferenceInput];
  };
}

export const isOrBlock = (block: Block): block is OrBlock =>
  block.opcode === opcode;
