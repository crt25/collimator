import { Block } from "../../generated/sb3";
import { BlockInputType } from "../../block-input-type";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "sensing_of";
export interface OfBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    OBJECT: [BlockInputType, BlockReferenceInput];
  };
  fields: {
    PROPERTY: [string, null];
  };
}

export const isOfBlock = (block: Block): block is OfBlock =>
  block.opcode === opcode;
