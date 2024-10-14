import { Block, TextPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockInputType } from "../../block-input-type";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "sensing_askandwait";

export interface AskAndWaitBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    QUESTION: [
      BlockInputType,
      TextPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
  };
}

export const isAskAndWaitBlock = (block: Block): block is AskAndWaitBlock =>
  block.opcode === opcode;
