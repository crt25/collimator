import { Block } from "../../generated/sb3";

const opcode = "sensing_dayssince2000";

export interface DaysSince2000Block extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
  fields: Record<string, never>;
}

export const isDaysSince2000Block = (
  block: Block,
): block is DaysSince2000Block => block.opcode === opcode;
