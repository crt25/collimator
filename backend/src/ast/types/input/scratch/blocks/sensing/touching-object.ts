import { Block } from "../../generated/sb3";
import { BlockInputType } from "../../block-input-type";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "sensing_touchingobject";

export interface TouchingObjectBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    TOUCHINGOBJECTMENU: [BlockInputType, BlockReferenceInput];
  };
}

export const isTouchingObjectBlock = (
  block: Block,
): block is TouchingObjectBlock => block.opcode === opcode;
