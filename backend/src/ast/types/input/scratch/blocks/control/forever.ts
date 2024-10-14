import { BlockInputType } from "../../block-input-type";
import { Block } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "control_forever";

export interface ForeverBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    SUBSTACK?: [BlockInputType, BlockReferenceInput];
  };
}

export const isForeverBlock = (block: Block): block is ForeverBlock =>
  block.opcode === opcode;
