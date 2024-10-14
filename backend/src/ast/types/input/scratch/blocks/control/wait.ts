import { BlockInputType } from "../../block-input-type";
import { Block, NumPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "control_wait";

export interface WaitBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    DURATION: [
      BlockInputType,
      NumPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
  };
}

export const isWaitBlock = (block: Block): block is WaitBlock =>
  block.opcode === opcode;
