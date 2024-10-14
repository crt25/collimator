import { Block } from "../../generated/sb3";
import { KeyboardKey } from "../keyboard-key";

const opcode = "event_whenkeypressed";

export interface WhenKeyPressedBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
  fields: {
    KEY_OPTION: [KeyboardKey, null];
  };
}

export const isWhenKeyPressedBlock = (
  block: Block,
): block is WhenKeyPressedBlock => block.opcode === opcode;
