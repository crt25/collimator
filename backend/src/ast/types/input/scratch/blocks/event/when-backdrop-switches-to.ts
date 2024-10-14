import { Block } from "../../generated/sb3";

const opcode = "event_whenbackdropswitchesto";

export interface WhenBackdropSwitchesToBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
  fields: {
    BACKDROP: [string, null];
  };
}

export const isWhenBackdropSwitchesToBlock = (
  block: Block,
): block is WhenBackdropSwitchesToBlock => block.opcode === opcode;
