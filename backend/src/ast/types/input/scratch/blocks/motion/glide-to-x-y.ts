import { Block, NumPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockInputType } from "../../block-input-type";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "motion_glidesecstoxy";

export interface GlideToXYBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    SECS: [
      BlockInputType,
      NumPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
    X: [BlockInputType, NumPrimitive | VariablePrimitive | BlockReferenceInput];
    Y: [BlockInputType, NumPrimitive | VariablePrimitive | BlockReferenceInput];
  };
}

export const isGlideToXYBlock = (block: Block): block is GlideToXYBlock =>
  block.opcode === opcode;
