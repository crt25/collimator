import { BlockInputType } from "../../block-input-type";
import { Block } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "control_wait_until";

export interface WaitUntilBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    CONDITION?: [BlockInputType, BlockReferenceInput];
  };
}

export const isWaitUntilBlock = (block: Block): block is WaitUntilBlock =>
  block.opcode === opcode;
