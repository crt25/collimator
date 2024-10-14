import { BlockInputType } from "../../block-input-type";
import { Block, NumPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "looks_goforwardbackwardlayers";

export interface GoForwardBackwardLayersBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    NUM: [
      BlockInputType,
      NumPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
  };
  fields: {
    // https://github.com/scratchfoundation/scratch-blocks/blob/2e3a31e555a611f0c48d7c57074e2e54104c04ce/blocks_vertical/looks.js#L494
    EFFECT: ["forward" | "backward", null];
  };
}

export const isGoForwardBackwardLayersBlock = (
  block: Block,
): block is GoForwardBackwardLayersBlock => block.opcode === opcode;
