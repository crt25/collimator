import { Block } from "../../generated/sb3";

const opcode = "looks_gotofrontback";

export interface GoToFrontBackBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
  fields: {
    // https://github.com/scratchfoundation/scratch-blocks/blob/2e3a31e555a611f0c48d7c57074e2e54104c04ce/blocks_vertical/looks.js#L470
    EFFECT: ["front" | "back", null];
  };
}

export const isGoToFrontBackBlock = (
  block: Block,
): block is GoToFrontBackBlock => block.opcode === opcode;
