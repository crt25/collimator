import { Block, NumPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockInputType } from "../../block-input-type";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "motion_setx";

export interface SetXBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    DX: [
      BlockInputType,
      NumPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
  };
}

export const isSetXBlock = (block: Block): block is SetXBlock =>
  block.opcode === opcode;
