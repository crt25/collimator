import { BlockInputType } from "../../block-input-type";
import { Block } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "control_if_else";

export interface IfElseBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    CONDITION?: [BlockInputType, BlockReferenceInput];
    SUBSTACK?: [BlockInputType, BlockReferenceInput];
    SUBSTACK2?: [BlockInputType, BlockReferenceInput];
  };
}

export const isIfElseBlock = (block: Block): block is IfElseBlock =>
  block.opcode === opcode;
