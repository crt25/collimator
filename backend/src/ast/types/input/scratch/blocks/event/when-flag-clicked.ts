import { Block } from "../../generated/sb3";

const opcode = "event_whenflagclicked";

export interface WhenFlagClickedBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
}

export const isWhenFlagClickedBlock = (
  block: Block,
): block is WhenFlagClickedBlock => block.opcode === opcode;
