import { Block } from "../../generated/sb3";

const opcode = "event_whenthisspriteclicked";

export interface WhenThisSpriteIsClickedBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
}

export const iswhenThisSpriteIsClickedBlock = (
  block: Block,
): block is WhenThisSpriteIsClickedBlock => block.opcode === opcode;
