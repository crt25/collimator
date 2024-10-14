import { Block } from "../../generated/sb3";

const opcode = "sensing_answer";

export interface AnswerBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
  fields: Record<string, never>;
}

export const isAnswerBlock = (block: Block): block is AnswerBlock =>
  block.opcode === opcode;
