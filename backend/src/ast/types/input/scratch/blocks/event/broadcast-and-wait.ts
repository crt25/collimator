import { BlockInputType } from "../../block-input-type";
import { Block } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "event_broadcastandwait";

export interface BroadcastAndWaitBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    BROADCAST_INPUT: [BlockInputType, BlockReferenceInput | null];
  };
}

export const isBroadcastAndWaitBlock = (
  block: Block,
): block is BroadcastAndWaitBlock => block.opcode === opcode;
