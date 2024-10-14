import { Block, NumPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockInputType } from "../../block-input-type";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "motion_changeyby";

export interface ChangeYByBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    DX: [
      BlockInputType,
      NumPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
  };
}

export const isChangeYByBlock = (block: Block): block is ChangeYByBlock =>
  block.opcode === opcode;
