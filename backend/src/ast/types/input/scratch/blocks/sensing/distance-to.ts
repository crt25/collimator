import { Block } from "../../generated/sb3";
import { BlockInputType } from "../../block-input-type";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "sensing_distanceto";

export interface DistanceToBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    DISTANCETOMENU: [BlockInputType, BlockReferenceInput | null];
  };
}

export const isDistanceToBlock = (block: Block): block is DistanceToBlock =>
  block.opcode === opcode;
