import { BlockInputType } from "../../block-input-type";
import { Block, TextPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "operator_round";

export interface RoundBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    STRING: [
      BlockInputType,
      TextPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
  };
}

export const isRoundBlock = (block: Block): block is RoundBlock =>
  block.opcode === opcode;
