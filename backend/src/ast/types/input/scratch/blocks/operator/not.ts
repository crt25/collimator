import { BlockInputType } from "../../block-input-type";
import { Block } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "operator_not";

export interface NotBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    OPERAND: [BlockInputType, BlockReferenceInput];
  };
}

export const isNotBlock = (block: Block): block is NotBlock =>
  block.opcode === opcode;
