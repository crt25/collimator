import { Block } from "../../generated/sb3";

const opcode = "sensing_setdragmode";

export interface SetDragModeBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
  fields: {
    PROPERTY: [string, null];
  };
}

export const isSetDragModeBlock = (block: Block): block is SetDragModeBlock =>
  block.opcode === opcode;
