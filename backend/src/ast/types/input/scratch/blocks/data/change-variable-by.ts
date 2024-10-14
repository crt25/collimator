import { BlockInputType } from "../../block-input-type";
import { Block, NumPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "data_changevariableby";

export interface ChangeVariableByBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    VALUE: [
      BlockInputType,
      NumPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
  };
  fields: {
    VARIABLE: [string, string];
  };
}

export const isChangeVariableByBlock = (
  block: Block,
): block is ChangeVariableByBlock => block.opcode === opcode;
