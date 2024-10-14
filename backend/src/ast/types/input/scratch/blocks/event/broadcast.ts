import { BlockInputType } from "../../block-input-type";
import { Block } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "event_broadcast";

export interface BroadcastBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    BROADCAST_INPUT: [BlockInputType, BlockReferenceInput | null];
  };
}

export const isBroadcastBlock = (block: Block): block is BroadcastBlock =>
  block.opcode === opcode;
