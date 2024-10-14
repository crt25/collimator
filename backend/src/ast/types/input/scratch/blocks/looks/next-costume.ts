import { Block } from "../../generated/sb3";

const opcode = "looks_nextcostume";

export interface NextCostumeBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
}

export const isNextCostumeBlock = (block: Block): block is NextCostumeBlock =>
  block.opcode === opcode;
