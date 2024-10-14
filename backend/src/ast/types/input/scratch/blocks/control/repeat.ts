import { BlockInputType } from "../../block-input-type";
import { Block, NumPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "control_repeat";

export interface RepeatBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    TIMES: [
      BlockInputType,
      NumPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
    SUBSTACK?: [BlockInputType, BlockReferenceInput];
  };
}

export const isRepeatBlock = (block: Block): block is RepeatBlock =>
  block.opcode === opcode;
