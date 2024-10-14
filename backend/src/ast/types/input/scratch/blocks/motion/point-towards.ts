import { Block } from "../../generated/sb3";
import { BlockInputType } from "../../block-input-type";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "motion_pointtowards";

export interface PointTowardsBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    TOWARDS: [BlockInputType, BlockReferenceInput | null];
  };
}

export const isPointTowardsBlock = (block: Block): block is PointTowardsBlock =>
  block.opcode === opcode;
