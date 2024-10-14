import { Block, TextPrimitive } from "../../generated/sb3";
import { BlockInputType } from "../../block-input-type";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "looks_switchbackdroptoandwait";

export interface SwitchBackDropToAndWaitBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    BACKDROP: [BlockInputType, TextPrimitive | BlockReferenceInput];
  };
}

export const isSwitchBackDropToAndWaitBlock = (
  block: Block,
): block is SwitchBackDropToAndWaitBlock => block.opcode === opcode;
