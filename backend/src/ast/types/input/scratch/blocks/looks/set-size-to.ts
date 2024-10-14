import { BlockInputType } from "../../block-input-type";
import { Block, NumPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "looks_setsizeto";

export interface SetSizeToBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    SIZE: [
      BlockInputType,
      NumPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
  };
}

export const isSetSizeToBlock = (block: Block): block is SetSizeToBlock =>
  block.opcode === opcode;
