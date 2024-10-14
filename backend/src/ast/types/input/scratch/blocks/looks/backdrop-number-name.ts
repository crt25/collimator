import { Block } from "../../generated/sb3";

const opcode = "looks_backdropnumbername";

export interface BackdropNumberNameBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
  fields: {
    NUMBER_NAME: [string, null];
  };
}

export const isBackdropNumberNameBlock = (
  block: Block,
): block is BackdropNumberNameBlock => block.opcode === opcode;
