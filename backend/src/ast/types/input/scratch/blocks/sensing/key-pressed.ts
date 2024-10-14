import { Block } from "../../generated/sb3";
import { BlockInputType } from "../../block-input-type";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "sensing_keypressed";

export interface KeyPressedBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    KEY_OPTION: [BlockInputType, BlockReferenceInput];
  };
}

export const isKeyPressedBlock = (block: Block): block is KeyPressedBlock =>
  block.opcode === opcode;
