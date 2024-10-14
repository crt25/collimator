import { Block, NumPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockInputType } from "../../block-input-type";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "motion_turnright";

export interface TurnRightBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    STEPS: [
      BlockInputType,
      NumPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
  };
}

export const isTurnRightBlock = (block: Block): block is TurnRightBlock =>
  block.opcode === opcode;
