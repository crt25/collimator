import { Block } from "../../generated/sb3";

const opcode = "data_showvariable";

export interface ShowVariableBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
  fields: {
    VARIABLE: [string, string];
  };
}

export const isShowVariableBlock = (block: Block): block is ShowVariableBlock =>
  block.opcode === opcode;
