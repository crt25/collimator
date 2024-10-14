import { Block } from "../../generated/sb3";

const opcode = "sensing_keyoptions";

export interface KeyOptionsBlock extends Block {
  opcode: typeof opcode;
  fields: {
    KEY_OPTION: [string | null];
  };
}

export const isKeyOptionsBlock = (block: Block): block is KeyOptionsBlock =>
  block.opcode === opcode;
