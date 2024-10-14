import { BlockInputType } from "../../block-input-type";
import { Block, TextPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "data_setvariableto";

export interface SetVariableToBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    VALUE: [
      BlockInputType,
      TextPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
  };
  fields: {
    VARIABLE: [string, string];
  };
}

export const isSetVariableToBlock = (
  block: Block,
): block is SetVariableToBlock => block.opcode === opcode;
