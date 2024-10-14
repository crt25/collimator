import { Block } from "../../generated/sb3";

const opcode = "motion_direction";

export interface DirectionBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
  fields: Record<string, never>;
}

export const isDirectionBlock = (block: Block): block is DirectionBlock =>
  block.opcode === opcode;
