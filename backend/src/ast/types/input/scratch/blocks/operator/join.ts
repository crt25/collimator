import { BlockInputType } from "../../block-input-type";
import { Block, TextPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "operator_join";

export interface JoinBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    STRING1: [
      BlockInputType,
      TextPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
    STRING2: [
      BlockInputType,
      TextPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
  };
}

export const IsJoinBlock = (block: Block): block is JoinBlock =>
  block.opcode === opcode;
