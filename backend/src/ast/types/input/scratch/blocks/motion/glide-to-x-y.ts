import { Block, NumPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockInputType } from "../../block-input-type";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "motion_glidesecstoxy";

type NumberInput = NumPrimitive | VariablePrimitive | BlockReferenceInput;

export interface GlideToXYBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    SECS: [BlockInputType, NumberInput];
    X: [BlockInputType, NumberInput];
    Y: [BlockInputType, NumberInput];
  };
}

export const isGlideToXYBlock = (block: Block): block is GlideToXYBlock =>
  block.opcode === opcode;
