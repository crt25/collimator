import { BlockInputType } from "../../block-input-type";
import { Block, NumPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "looks_changesizeby";

export interface ChangeSizeByBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    CHANGE: [
      BlockInputType,
      NumPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
  };
}

export const isChangeSizeByBlock = (block: Block): block is ChangeSizeByBlock =>
  block.opcode === opcode;
