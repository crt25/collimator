import { BlockInputType } from "../../block-input-type";
import { Block } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "motion_setrotationstyle";

export interface SetRotationStyleBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    TOWARDS: [BlockInputType, BlockReferenceInput | null];
  };
}

export const isSetRotationStyleBlock = (
  block: Block,
): block is SetRotationStyleBlock => block.opcode === opcode;
