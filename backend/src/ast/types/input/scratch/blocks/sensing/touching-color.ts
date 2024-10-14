import { Block, ColorPrimitive } from "../../generated/sb3";
import { BlockInputType } from "../../block-input-type";

const opcode = "sensing_touchingcolor";

export interface TouchingColorBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    COLOR: [BlockInputType, ColorPrimitive];
  };
}

export const isTouchingColorBlock = (
  block: Block,
): block is TouchingColorBlock => block.opcode === opcode;
