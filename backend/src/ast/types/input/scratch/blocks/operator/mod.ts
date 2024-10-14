import { BlockInputType } from "../../block-input-type";
import { Block, NumPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "operator_mod";

export interface ModBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    NUM1: [
      BlockInputType,
      NumPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
    NUM2: [
      BlockInputType,
      NumPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
  };
}

export const isModBlock = (block: Block): block is ModBlock =>
  block.opcode === opcode;
