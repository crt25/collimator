import { Block } from "../../generated/sb3";

const opcode = "control_create_clone_of_menu";

export interface CreateCloneOfMenuBlock extends Block {
  opcode: typeof opcode;
  fields: {
    CLONE_OPTION: [string | null];
  };
}

export const isCreateCloneOfMenuBlock = (
  block: Block,
): block is CreateCloneOfMenuBlock => block.opcode === opcode;
