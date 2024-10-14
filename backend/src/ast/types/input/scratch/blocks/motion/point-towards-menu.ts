import { Block } from "../../generated/sb3";

const opcode = "motion_pointtowards_menu";

export interface PointTowardsMenuBlock extends Block {
  opcode: typeof opcode;
  fields: {
    TOWARDS: [string | null];
  };
}

export const isPointTowardsMenuBlock = (
  block: Block,
): block is PointTowardsMenuBlock => block.opcode === opcode;
