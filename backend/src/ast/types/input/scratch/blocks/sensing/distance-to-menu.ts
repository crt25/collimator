import { Block } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "sensing_distancetomenu";

export interface DistanceToMenuBlock extends Block {
  opcode: typeof opcode;
  fields: {
    DISTANCETOMENU: [BlockReferenceInput | null];
  };
}

export const isDistanceToMenuBlock = (
  block: Block,
): block is DistanceToMenuBlock => block.opcode === opcode;
