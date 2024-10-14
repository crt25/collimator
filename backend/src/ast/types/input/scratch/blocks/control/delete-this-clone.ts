import { Block } from "../../generated/sb3";

const opcode = "control_delete_this_clone";

export interface DeleteThisCloneBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
  fields: Record<string, never>;
}

export const isDeleteThisCloneBlock = (
  block: Block,
): block is DeleteThisCloneBlock => block.opcode === opcode;
