import { Block } from "../../generated/sb3";

const opcode = "argument_reporter_boolean";

export interface ArgumentBooleanBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
  fields: {
    // this string is the argument name
    // note that if the same argument name is defined multiple times, scratch always considers the latest one
    VALUE: [string, null];
  };
}

export const isArgumentBooleanBlock = (
  block: Block,
): block is ArgumentBooleanBlock => block.opcode === opcode;
