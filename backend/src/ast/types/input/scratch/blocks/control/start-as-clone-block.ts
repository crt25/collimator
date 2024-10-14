import { Block } from "../../generated/sb3";

const opcode = "control_start_as_clone";

export interface StartAsCloneBlock extends Block {
  opcode: typeof opcode;
  inputs: Record<string, never>;
}

export const isStartAsCloneBlock = (block: Block): block is StartAsCloneBlock =>
  block.opcode === opcode;
