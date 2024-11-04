import { Block } from "../../generated/sb3";

export interface ArbitraryHatBlock extends Block {
  opcode: string;
}

export const isArbitraryHatBlock = (
  block: Block,
): block is ArbitraryHatBlock => {
  // extension block opcodes are of the form `extensionName_blockType_<opcode>`
  const parts = block.opcode.split("_");

  return parts.length === 3 && parts[1] === "event";
};
