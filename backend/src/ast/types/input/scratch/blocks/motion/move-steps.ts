import { Block, NumPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockInputType } from "../../block-input-type";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "motion_movesteps";

export interface MoveStepsBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    STEPS: [
      BlockInputType,
      NumPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
  };
}

export const isMoveStepsBlock = (block: Block): block is MoveStepsBlock =>
  block.opcode === opcode;
