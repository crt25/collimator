import {
  Block,
  NumPrimitive,
  TextPrimitive,
  VariablePrimitive,
} from "../../generated/sb3";
import { BlockInputType } from "../../block-input-type";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "looks_thinkforsecs";

export interface ThinkForSecsBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    SECS: [
      BlockInputType,
      NumPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
    MESSAGE: [
      BlockInputType,
      TextPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
  };
}

export const isThinkForSecsBlock = (block: Block): block is ThinkForSecsBlock =>
  block.opcode === opcode;
