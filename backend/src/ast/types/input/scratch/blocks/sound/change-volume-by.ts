import { BlockInputType } from "../../block-input-type";
import { Block, NumPrimitive, VariablePrimitive } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "sound_changevolumeby";

export interface ChangeVolumeByBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    VOLUME: [
      BlockInputType,
      NumPrimitive | VariablePrimitive | BlockReferenceInput,
    ];
  };
}

export const isChangeVolumeByBlock = (
  block: Block,
): block is ChangeVolumeByBlock => block.opcode === opcode;
