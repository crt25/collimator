import { Block } from "../../generated/sb3";

const opcode = "sound_cleareffects";

export interface ClearEffectsBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
}

export const isClearEffectsBlock = (block: Block): block is ClearEffectsBlock =>
  block.opcode === opcode;
