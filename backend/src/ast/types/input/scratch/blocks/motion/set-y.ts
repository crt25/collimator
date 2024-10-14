import { Block, NumPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockInputType } from "../../block-input-type";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "motion_sety";

export interface SetYBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    DX: [
      BlockInputType,
      NumPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
  };
}

export const isSetYBlock = (block: Block): block is SetYBlock =>
  block.opcode === opcode;
