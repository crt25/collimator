import { Block } from "../../generated/sb3";

const opcode = "motion_ifonedgebounce";

export interface IfOnEdgeBounceBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
}

export const isIfOnEdgeBounceBlock = (
  block: Block,
): block is IfOnEdgeBounceBlock => block.opcode === opcode;
