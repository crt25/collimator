import { CodeNode } from "src/ast/types/general-ast/ast-nodes";
import { match, P } from "ts-pattern";
import { NonHatBlock, TreeNode } from "./types";
import {
  BackdropNumberNameBlock,
  BackdropsBlock,
  ChangeSizeByBlock,
  ClearGraphicsEffectsBlock,
  CostumeBlock,
  CostumeNumberNameBlock,
  GoForwardBackwardLayersBlock,
  GoToFrontBackBlock,
  HideBlock,
  isBackdropNumberNameBlock,
  isBackdropsBlock,
  isChangeEffectByBlock,
  isChangeSizeByBlock,
  isClearGraphicsEffectsBlock,
  isCostumeBlock,
  isCostumeNumberNameBlock,
  isGoForwardBackwardLayersBlock,
  isGoToFrontBackBlock,
  isHideBlock,
  isNextBackdropBlock,
  isNextCostumeBlock,
  isSayBlock,
  isSayForSecsBlock,
  isSetEffectToBlock,
  isSetSizeToBlock,
  isShowBlock,
  isSizeBlock,
  isSwitchBackDropToAndWaitBlock,
  isSwitchBackDropToBlock,
  isSwitchCostumeToBlock,
  isThinkBlock,
  isThinkForSecsBlock,
  LooksCodeBlock,
  LooksExpressionBlock,
  NextBackdropBlock,
  NextCostumeBlock,
  SayBlock,
  SayForSecsBlock,
  SetEffectToBlock,
  SetSizeToBlock,
  ShowBlock,
  SizeBlock,
  SwitchBackDropToAndWaitBlock,
  SwitchBackDropToBlock,
  SwitchCostumeToBlock,
  ThinkBlock,
  ThinkForSecsBlock,
} from "src/ast/types/input/scratch/blocks/looks";
import { ChangeEffectByBlock } from "src/ast/types/input/scratch/blocks/looks";
import {
  createFunctionCallBlock,
  createFunctionCallExpressionBlock,
  createLiteralNode,
  createVariableExpressionBlock,
} from "./helpers";
import { ExpressionNode } from "src/ast/types/general-ast/ast-nodes/code-node/expression-node";

type LooksCodeTreeNode = LooksCodeBlock & TreeNode;
type LooksExpressionTreeNode = LooksExpressionBlock & TreeNode;

export const isLooksCodeBlock = (block: NonHatBlock): block is LooksCodeBlock =>
  isChangeEffectByBlock(block) ||
  isChangeSizeByBlock(block) ||
  isClearGraphicsEffectsBlock(block) ||
  isGoForwardBackwardLayersBlock(block) ||
  isGoToFrontBackBlock(block) ||
  isHideBlock(block) ||
  isNextBackdropBlock(block) ||
  isNextCostumeBlock(block) ||
  isSayForSecsBlock(block) ||
  isSayBlock(block) ||
  isSetEffectToBlock(block) ||
  isSetSizeToBlock(block) ||
  isShowBlock(block) ||
  isSwitchBackDropToAndWaitBlock(block) ||
  isSwitchBackDropToBlock(block) ||
  isSwitchCostumeToBlock(block) ||
  isThinkForSecsBlock(block) ||
  isThinkBlock(block);

export const isLooksExpressionBlock = (
  block: NonHatBlock,
): block is LooksExpressionBlock =>
  isCostumeBlock(block) ||
  isBackdropsBlock(block) ||
  isCostumeNumberNameBlock(block) ||
  isBackdropNumberNameBlock(block) ||
  isSizeBlock(block);

export const convertLooksBlockTreeToCode = (
  looksBlock: LooksCodeTreeNode,
): CodeNode[] =>
  match(looksBlock)
    .returnType<CodeNode[]>()
    .with(
      P.when(isChangeEffectByBlock),
      P.when(isChangeSizeByBlock),
      P.when(isClearGraphicsEffectsBlock),
      P.when(isGoForwardBackwardLayersBlock),
      P.when(isGoToFrontBackBlock),
      P.when(isHideBlock),
      P.when(isNextBackdropBlock),
      P.when(isNextCostumeBlock),
      P.when(isSayForSecsBlock),
      P.when(isSayBlock),
      P.when(isSetEffectToBlock),
      P.when(isSetSizeToBlock),
      P.when(isShowBlock),
      P.when(isSwitchBackDropToAndWaitBlock),
      P.when(isSwitchBackDropToBlock),
      P.when(isSwitchCostumeToBlock),
      P.when(isThinkForSecsBlock),
      P.when(isThinkBlock),
      (
        block: (
          | ChangeEffectByBlock
          | ChangeSizeByBlock
          | ClearGraphicsEffectsBlock
          | GoForwardBackwardLayersBlock
          | GoToFrontBackBlock
          | HideBlock
          | NextBackdropBlock
          | NextCostumeBlock
          | SayForSecsBlock
          | SayBlock
          | SetEffectToBlock
          | SetSizeToBlock
          | ShowBlock
          | SwitchBackDropToAndWaitBlock
          | SwitchBackDropToBlock
          | SwitchCostumeToBlock
          | ThinkForSecsBlock
          | ThinkBlock
        ) &
          LooksCodeTreeNode,
      ) => [createFunctionCallBlock(block)],
    )
    .exhaustive();

export const convertLooksBlockTreeToExpression = (
  looksBlock: LooksExpressionTreeNode,
): ExpressionNode =>
  match(looksBlock)
    .returnType<ExpressionNode>()
    .with(
      P.when(isCostumeNumberNameBlock),
      P.when(isBackdropNumberNameBlock),
      (
        block: (CostumeNumberNameBlock | BackdropNumberNameBlock) &
          LooksExpressionTreeNode,
      ) => createFunctionCallExpressionBlock(block),
    )
    .with(P.when(isSizeBlock), (block: SizeBlock & LooksExpressionTreeNode) =>
      createVariableExpressionBlock(block.opcode),
    )
    .with(
      P.when(isCostumeBlock),
      (block: CostumeBlock & LooksExpressionTreeNode) =>
        createLiteralNode("string", block.fields.COSTUME[0] || ""),
    )
    .with(
      P.when(isBackdropsBlock),
      (block: BackdropsBlock & LooksExpressionTreeNode) =>
        createLiteralNode("string", block.fields.BACKDROP[0] || ""),
    )
    .exhaustive();
