import { Block, TextPrimitive } from "../../generated/sb3";
import { BlockInputType } from "../../block-input-type";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "looks_switchbackdropto";

export interface SwitchBackDropToBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    BACKDROP: [BlockInputType, TextPrimitive | BlockReferenceInput];
  };
}

export const isSwitchBackDropToBlock = (
  block: Block,
): block is SwitchBackDropToBlock => block.opcode === opcode;
