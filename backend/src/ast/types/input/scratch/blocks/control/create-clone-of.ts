import { Block } from "../../generated/sb3";
import { BlockInputType } from "../../block-input-type";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "control_create_clone_of";

export interface CreateCloneOfBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    CLONE_OPTION: [BlockInputType, BlockReferenceInput];
  };
}

export const isCreateCloneOfBlock = (
  block: Block,
): block is CreateCloneOfBlock => block.opcode === opcode;
