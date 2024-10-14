import { BlockInputType } from "../../block-input-type";
import { Block, NumPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "event_whengreaterthan";

export interface WhenGreaterThanBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    VALUE: [
      BlockInputType,
      NumPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
  };
  fields: {
    WHENGREATERTHANMENU: [string, null];
  };
}

export const isWhenGreaterThanBlock = (
  block: Block,
): block is WhenGreaterThanBlock => block.opcode === opcode;
