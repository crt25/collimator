import { StatementNode } from "src/ast/types/general-ast/ast-nodes";
import { match, P } from "ts-pattern";
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
  LooksStatementBlock,
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
  ChangeEffectByBlock,
} from "src/ast/types/input/scratch/blocks/looks";
import { ExpressionNode } from "src/ast/types/general-ast/ast-nodes/expression-node";
import { NonHatBlock, TreeNode } from "./types";
import {
  createFunctionCallBlock,
  createFunctionCallExpressionBlock,
  createLiteralNode,
  createVariableExpressionBlock,
} from "./helpers";

type LooksCodeTreeNode = LooksStatementBlock & TreeNode;
type LooksExpressionTreeNode = LooksExpressionBlock & TreeNode;

export const isLooksStatementBlock = (
  block: NonHatBlock,
): block is LooksStatementBlock =>
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

export const convertLooksBlockTreeToStatement = (
  looksBlock: LooksCodeTreeNode,
): StatementNode[] =>
  match(looksBlock)
    .returnType<StatementNode[]>()
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
        createLiteralNode("string", block.fields.COSTUME[0] ?? ""),
    )
    .with(
      P.when(isBackdropsBlock),
      (block: BackdropsBlock & LooksExpressionTreeNode) =>
        createLiteralNode("string", block.fields.BACKDROP[0] ?? ""),
    )
    .exhaustive();
