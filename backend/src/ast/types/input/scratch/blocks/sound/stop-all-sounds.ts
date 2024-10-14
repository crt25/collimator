import { Block } from "../../generated/sb3";
import { BlockInputType } from "../../block-input-type";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "sound_stopallsounds";

export interface StopAllSoundsBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    SOUND_MENU: [BlockInputType, BlockReferenceInput];
  };
}

export const isStopAllSoundsBlock = (
  block: Block,
): block is StopAllSoundsBlock => block.opcode === opcode;
