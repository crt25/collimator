import { Block } from "../../generated/sb3";

const opcode = "data_hidevariable";

export interface HideVariableBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
  fields: {
    VARIABLE: [string, string];
  };
}

export const isHideVariableBlock = (block: Block): block is HideVariableBlock =>
  block.opcode === opcode;
