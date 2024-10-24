import { Block } from "../../generated/sb3";

export interface ArbitraryFunctionCallBlock extends Block {
  opcode: string;
  inputs: Block["inputs"];
}

export const isArbitraryStatementBlock = (
  block: Block,
): block is ArbitraryFunctionCallBlock => {
  // extension block opcodes are of the form `extensionName_blockType_<opcode>`
  const parts = block.opcode.split("_");

  return parts.length === 3 && parts[1] === "functionCall";
};
