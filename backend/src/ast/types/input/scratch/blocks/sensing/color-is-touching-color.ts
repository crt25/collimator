import { Block, ColorPrimitive } from "../../generated/sb3";
import { BlockInputType } from "../../block-input-type";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "sensing_coloristouchingcolor";

export interface ColorIsTouchingColorBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    COLOR: [BlockInputType, ColorPrimitive | BlockReferenceInput];
    COLOR2: [BlockInputType, ColorPrimitive | BlockReferenceInput];
  };
}

export const isColorIsTouchingColorBlock = (
  block: Block,
): block is ColorIsTouchingColorBlock => block.opcode === opcode;
