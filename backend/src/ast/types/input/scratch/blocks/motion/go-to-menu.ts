import { Block } from "../../generated/sb3";

const opcode = "motion_goto_menu";

export interface GoToMenuBlock extends Block {
  opcode: typeof opcode;
  fields: {
    TO: [string | null];
  };
}

export const isGoToMenuBlock = (block: Block): block is GoToMenuBlock =>
  block.opcode === opcode;
