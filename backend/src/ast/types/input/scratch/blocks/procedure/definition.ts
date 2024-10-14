import { BlockInputType } from "../../block-input-type";
import { Block } from "../../generated/sb3";
import { BlockReferenceInput } from "../block-reference-input";

const opcode = "procedures_definition";

export interface DefinitionBlock extends Block {
  opcode: typeof opcode;
  inputs: {
    custom_block: [BlockInputType, BlockReferenceInput];
  };
  fields: Record<string, never>;
}

export const isDefinitionBlock = (block: Block): block is DefinitionBlock =>
  block.opcode === opcode;
