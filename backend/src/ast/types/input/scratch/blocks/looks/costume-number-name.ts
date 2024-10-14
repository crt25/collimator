import { Block } from "../../generated/sb3";

const opcode = "looks_costumenumbername";

export interface CostumeNumberNameBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
  fields: {
    NUMBER_NAME: [string, null];
  };
}

export const isCostumeNumberNameBlock = (
  block: Block,
): block is CostumeNumberNameBlock => block.opcode === opcode;
