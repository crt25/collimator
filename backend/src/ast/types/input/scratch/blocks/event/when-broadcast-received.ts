import { Block } from "../../generated/sb3";

const opcode = "event_whenbroadcastreceived";

export interface WhenBroadcastReceivedBlock extends Block {
  opcode: typeof opcode;
  fields: {
    BROADCAST_OPTION: [string, string];
  };
}

export const isWhenBroadcastReceivedBlock = (
  block: Block,
): block is WhenBroadcastReceivedBlock => block.opcode === opcode;
