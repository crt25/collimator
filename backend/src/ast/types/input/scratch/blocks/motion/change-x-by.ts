import { Block, NumPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockInputType } from "../../block-input-type";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "motion_changexby";

export interface ChangeXByBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    DX: [
      BlockInputType,
      NumPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
  };
}

export const isChangeXByBlock = (block: Block): block is ChangeXByBlock =>
  block.opcode === opcode;
