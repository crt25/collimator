import { BlockInputType } from "../../block-input-type";
import { Block } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "control_repeat_until";

export interface RepeatUntilBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    CONDITION?: [BlockInputType, BlockReferenceInput];
    SUBSTACK?: [BlockInputType, BlockReferenceInput];
  };
}

export const isRepeatUntilBlock = (block: Block): block is RepeatUntilBlock =>
  block.opcode === opcode;
