import { Block } from "../../generated/sb3";

const opcode = "sensing_loudness";

export interface LoudnessBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
  fields: Record<string, never>;
}

export const isLoudnessBlock = (block: Block): block is LoudnessBlock =>
  block.opcode === opcode;
