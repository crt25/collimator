import { Block } from "../../generated/sb3";

const opcode = "sensing_touchingobjectmenu";

export interface TouchingObjectMenuBlock extends Block {
  opcode: typeof opcode;
  fields: {
    TOUCHINGOBJECTMENU: [string | null];
  };
}

export const isTouchingObjectMenuBlock = (
  block: Block,
): block is TouchingObjectMenuBlock => block.opcode === opcode;
