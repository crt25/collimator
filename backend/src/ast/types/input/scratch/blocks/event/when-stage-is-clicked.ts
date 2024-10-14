import { Block } from "../../generated/sb3";

const opcode = "event_whenstageclicked";

export interface WhenStageIsClickedBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
}

export const isWhenStageIsClickedBlock = (
  block: Block,
): block is WhenStageIsClickedBlock => block.opcode === opcode;
