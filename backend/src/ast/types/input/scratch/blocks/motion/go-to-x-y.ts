import { Block, NumPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockInputType } from "../../block-input-type";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "motion_gotoxy";

export interface GoToXYBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    X: [BlockInputType, NumPrimitive | VariablePrimitive | BlockReferenceInput];
    Y: [BlockInputType, NumPrimitive | VariablePrimitive | BlockReferenceInput];
  };
}

export const IsGoToXYBlock = (block: Block): block is GoToXYBlock =>
  block.opcode === opcode;
