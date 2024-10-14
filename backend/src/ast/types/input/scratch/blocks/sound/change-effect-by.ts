import { BlockInputType } from "../../block-input-type";
import { Block, NumPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "sound_changeeffectby";

export interface ChangeEffectByBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    CHANGE: [
      BlockInputType,
      NumPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
  };
  fields: {
    EFFECT: [string, null];
  };
}

export const isChangeEffectByBlock = (
  block: Block,
): block is ChangeEffectByBlock => block.opcode === opcode;
