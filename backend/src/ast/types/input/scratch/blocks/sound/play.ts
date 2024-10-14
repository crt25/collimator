import { Block } from "../../generated/sb3";
import { BlockInputType } from "../../block-input-type";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "sound_play";

export interface PlayBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    SOUND_MENU: [BlockInputType, BlockReferenceInput];
  };
}

export const isPlayBlock = (block: Block): block is PlayBlock =>
  block.opcode === opcode;
