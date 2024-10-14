import { Block, TextPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockInputType } from "../../block-input-type";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "looks_say";

export interface SayBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    MESSAGE: [
      BlockInputType,
      TextPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
  };
}

export const isSayBlock = (block: Block): block is SayBlock =>
  block.opcode === opcode;
