import { Block } from "../../generated/sb3";
import { BlockInputType } from "../../block-input-type";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "motion_goto";

export interface GoToBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    TO: [BlockInputType, BlockReferenceInput | null];
  };
}

export const isGoToBlock = (block: Block): block is GoToBlock =>
  block.opcode === opcode;
