import { Block } from "../../generated/sb3";

const opcode = "looks_cleargraphiceffects";

export interface ClearGraphicsEffectsBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
}

export const isClearGraphicsEffectsBlock = (
  block: Block,
): block is ClearGraphicsEffectsBlock => block.opcode === opcode;
