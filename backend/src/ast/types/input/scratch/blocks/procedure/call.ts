import { BlockInputType } from "../../block-input-type";
import { Block, TextPrimitive } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "procedures_call";

export interface CallBlockMutation
  extends Exclude<Block["mutation"], undefined> {
  proccode: string;
}

export interface CallBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    [argumentId: string]: [BlockInputType, TextPrimitive | BlockReferenceInput];
  };
  fields: Record<string, never>;

  mutation: CallBlockMutation;
}

export const isCallBlock = (block: Block): block is CallBlock =>
  block.opcode === opcode;
