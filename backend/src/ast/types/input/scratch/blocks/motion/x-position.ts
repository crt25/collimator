import { Block } from "../../generated/sb3";

const opcode = "motion_xposition";

export interface XPositionBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
  fields: Record<string, never>;
}

export const isXPositionBlock = (block: Block): block is XPositionBlock =>
  block.opcode === opcode;
