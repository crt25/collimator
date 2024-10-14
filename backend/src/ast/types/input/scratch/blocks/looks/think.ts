import { Block, TextPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockInputType } from "../../block-input-type";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "looks_think";

export interface ThinkBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    MESSAGE: [
      BlockInputType,
      TextPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
  };
}

export const isThinkBlock = (block: Block): block is ThinkBlock =>
  block.opcode === opcode;
