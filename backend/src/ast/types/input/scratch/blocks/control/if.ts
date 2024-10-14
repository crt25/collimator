import { BlockInputType } from "../../block-input-type";
import { Block } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "control_if";

export interface IfBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    CONDITION?: [BlockInputType, BlockReferenceInput];
    SUBSTACK?: [BlockInputType, BlockReferenceInput];
  };
}

export const isIfBlock = (block: Block): block is IfBlock =>
  block.opcode === opcode;
