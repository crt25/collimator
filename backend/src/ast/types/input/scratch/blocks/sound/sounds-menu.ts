import { Block } from "../../generated/sb3";

const opcode = "sound_sounds_menu";

export interface SoundsMenuBlock extends Block {
  opcode: typeof opcode;
  fields: {
    SOUND_MENU: [string | null];
  };
}

export const isSoundsMenuBlock = (block: Block): block is SoundsMenuBlock =>
  block.opcode === opcode;
