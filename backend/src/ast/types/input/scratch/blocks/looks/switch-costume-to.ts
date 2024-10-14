import { Block, TextPrimitive } from "../../generated/sb3";
import { BlockInputType } from "../../block-input-type";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "looks_switchcostumeto";

export interface SwitchCostumeToBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    COSTUME: [BlockInputType, TextPrimitive | BlockReferenceInput];
  };
}

export const isSwitchCostumeToBlock = (
  block: Block,
): block is SwitchCostumeToBlock => block.opcode === opcode;
