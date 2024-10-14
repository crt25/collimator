import { Block, NumPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockInputType } from "../../block-input-type";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "motion_glideto";

export interface GlideToBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    SECS: [
      BlockInputType,
      NumPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
    TO: [BlockInputType, BlockReferenceInput | null];
  };
}

export const isGlideToBlock = (block: Block): block is GlideToBlock =>
  block.opcode === opcode;
