import { Block } from "../../generated/sb3";

const opcode = "motion_glideto_menu";

export interface GlideToMenuBlock extends Block {
  opcode: typeof opcode;
  fields: {
    TO: [string | null];
  };
}

export const isGlideToMenuBlock = (block: Block): block is GlideToMenuBlock =>
  block.opcode === opcode;
