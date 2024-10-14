import { Block, NumPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockInputType } from "../../block-input-type";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "motion_pointindirection";

export interface PointInDirectionBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    DIRECTION: [
      BlockInputType,
      NumPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
  };
}

export const isPointInDirectionBlock = (
  block: Block,
): block is PointInDirectionBlock => block.opcode === opcode;
