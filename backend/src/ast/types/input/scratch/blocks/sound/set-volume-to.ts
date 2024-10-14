import { BlockInputType } from "../../block-input-type";
import { Block, NumPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "sound_setvolumeto";

export interface SetVolumeToBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    VOLUME: [
      BlockInputType,
      NumPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
  };
}

export const isSetVolumeToBlock = (block: Block): block is SetVolumeToBlock =>
  block.opcode === opcode;
