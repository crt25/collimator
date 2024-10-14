import { Block } from "../../generated/sb3";

const opcode = "sensing_username";

export interface UsernameBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
  fields: Record<string, never>;
}

export const isUsernameBlock = (block: Block): block is UsernameBlock =>
  block.opcode === opcode;
