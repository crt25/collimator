import {
  KnownBuiltinScratchStatementBlock,
  KnownBuiltinScratchExpressionBlock,
  KnownBuiltinScratchHatBlock,
} from "src/ast/types/input/scratch/blocks";
import { DefinitionBlock } from "src/ast/types/input/scratch/blocks/procedure/definition";
import {
  Block,
  Sprite,
  Stage,
  Target,
} from "src/ast/types/input/scratch/generated/sb3";

export type StageTarget = Stage & Target;
export type SpriteTarget = Sprite & Target;

export type NonHatBlock =
  | KnownBuiltinScratchStatementBlock
  | KnownBuiltinScratchExpressionBlock;

export type EventHatBlock = Exclude<
  KnownBuiltinScratchHatBlock,
  DefinitionBlock
>;

export type TreeNode = {
  /**
   * The unique identifier of the block.
   */
  __id: string;
  /**
   * A set of child blocks. This contains argument blocks such as operators, variables etc. but
   * _not_ the next block in the sequence even though it is a child in the scratch sb3 format.
   */
  __children: NonHatBlockTree[];

  /**
   * The next block in the sequence. This is null if there is no next block.
   */
  __next: StatementBlockTree | null;
};
export type BlockTree = Block & TreeNode;
export type StatementBlockTree = KnownBuiltinScratchStatementBlock & TreeNode;
export type ExpressionBlockTree = KnownBuiltinScratchExpressionBlock & TreeNode;
export type NonHatBlockTree = NonHatBlock & TreeNode;

export type BlockTreeWithEventHatRoot = EventHatBlock & TreeNode;
export type BlockTreeWithProcedureDefinitionRoot = DefinitionBlock & TreeNode;

export type BlockInputs = Exclude<Block["inputs"], undefined>;
export type BlockInputsKey = keyof BlockInputs;
export type BlockInputValue = BlockInputs[BlockInputsKey];

export enum ScratchInputType {
  number = 4, // 4-8 stand for number, https://github.com/scratchfoundation/scratch-parser/blob/665f05d739a202d565a4af70a201909393d456b2/lib/sb3_definitions.json#L133
  color = 9, // https://github.com/scratchfoundation/scratch-parser/blob/665f05d739a202d565a4af70a201909393d456b2/lib/sb3_definitions.json#L144
  text = 10, //https://github.com/scratchfoundation/scratch-parser/blob/665f05d739a202d565a4af70a201909393d456b2/lib/sb3_definitions.json#L158
  broadcast = 11, // https://github.com/scratchfoundation/scratch-parser/blob/665f05d739a202d565a4af70a201909393d456b2/lib/sb3_definitions.json#L169
  variable = 12, // https://github.com/scratchfoundation/scratch-parser/blob/665f05d739a202d565a4af70a201909393d456b2/lib/sb3_definitions.json#L181
  list = 13, // https://github.com/scratchfoundation/scratch-parser/blob/665f05d739a202d565a4af70a201909393d456b2/lib/sb3_definitions.json#L197
}
