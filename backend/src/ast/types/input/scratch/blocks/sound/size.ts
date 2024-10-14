import { Block } from "../../generated/sb3";

const opcode = "sound_volume";

export interface VolumeBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
  fields: Record<string, never>;
}

export const isVolumeBlock = (block: Block): block is VolumeBlock =>
  block.opcode === opcode;
