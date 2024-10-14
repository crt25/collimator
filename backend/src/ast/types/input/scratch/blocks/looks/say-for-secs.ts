import {
  Block,
  NumPrimitive,
  TextPrimitive,
  VariablePrimitive,
} from "../../generated/sb3";
import { BlockInputType } from "../../block-input-type";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "looks_sayforsecs";

export interface SayForSecsBlock extends Block {
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

export const isSayForSecsBlock = (block: Block): block is SayForSecsBlock =>
  block.opcode === opcode;
