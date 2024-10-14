import { Block } from "../../generated/sb3";
import { BlockInputType } from "../../block-input-type";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "sound_playuntildone";

export interface PlayUntilDoneBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    SOUND_MENU: [BlockInputType, BlockReferenceInput];
  };
}

export const isPlayUntilDoneBlock = (
  block: Block,
): block is PlayUntilDoneBlock => block.opcode === opcode;
