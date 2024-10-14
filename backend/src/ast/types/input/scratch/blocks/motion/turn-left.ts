import { Block, NumPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockInputType } from "../../block-input-type";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "motion_turnleft";

export interface TurnLeftBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    STEPS: [
      BlockInputType,
      NumPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
  };
}

export const isTurnLeftBlock = (block: Block): block is TurnLeftBlock =>
  block.opcode === opcode;
