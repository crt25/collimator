import { BlockInputType } from "../../block-input-type";
import { Block } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "operator_and";

export interface AndBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    OPERAND1: [BlockInputType, BlockReferenceInput];
    OPERAND2: [BlockInputType, BlockReferenceInput];
  };
}

export const isAndBlock = (block: Block): block is AndBlock =>
  block.opcode === opcode;
