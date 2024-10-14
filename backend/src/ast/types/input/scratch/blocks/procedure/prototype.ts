import { BlockInputType } from "../../block-input-type";
import { Block } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "procedures_prototype";

export interface PrototypeBlockMutation
  extends Exclude<Block["mutation"], undefined> {
  proccode: string;
  argumentids: string;
  argumentnames: string;
  argumentdefaults: string;
}

export interface PrototypeBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    [argumentId: string]: [BlockInputType, BlockReferenceInput];
  };
  fields: Record<string, never>;

  mutation: PrototypeBlockMutation;
}

export const isPrototypeBlock = (block: Block): block is PrototypeBlock =>
  block.opcode === opcode;
