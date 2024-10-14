import { Block } from "../../generated/sb3";

const opcode = "motion_yposition";

export interface YPositionBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
  fields: Record<string, never>;
}

export const isYPositionBlock = (block: Block): block is YPositionBlock =>
  block.opcode === opcode;
