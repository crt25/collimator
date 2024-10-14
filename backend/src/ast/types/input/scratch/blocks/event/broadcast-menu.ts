import { Block } from "../../generated/sb3";

const opcode = "event_broadcast_menu";

export interface BroadcastMenuBlock extends Block {
  opcode: typeof opcode;
  fields: {
    BROADCAST_OPTION: [string | null];
  };
}

export const isBroadcastMenuBlock = (
  block: Block,
): block is BroadcastMenuBlock => block.opcode === opcode;
