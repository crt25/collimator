import { BlockInputType } from "../../block-input-type";
import { Block, NumPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "sound_seteffectto";

export interface SetEffectToBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    VALUE: [
      BlockInputType,
      NumPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
  };
  fields: {
    EFFECT: [string, null];
  };
}

export const isSetEffectToBlock = (block: Block): block is SetEffectToBlock =>
  block.opcode === opcode;
