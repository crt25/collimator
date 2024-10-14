import { Block } from "../../generated/sb3";

const opcode = "event_whenkeypressed";

export interface WhenKeyPressedBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
  fields: {
    KEY_OPTION: [string, null];
  };
}

export const isWhenKeyPressedBlock = (
  block: Block,
): block is WhenKeyPressedBlock => block.opcode === opcode;
