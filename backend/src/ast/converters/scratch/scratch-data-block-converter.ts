import { StatementNode } from "src/ast/types/general-ast/ast-nodes";
import { match, P } from "ts-pattern";
import { NonHatBlock, TreeNode } from "./types";
import {
  AddToListBlock,
  ChangeVariableByBlock,
  DataStatementBlock,
  DataExpressionBlock,
  DeleteAllOfListBlock,
  DeleteOfListBlock,
  HideListBlock,
  HideVariableBlock,
  InsertAtListBlock,
  isAddToListBlock,
  isChangeVariableByBlock,
  isDeleteAllOfListBlock,
  isDeleteOfListBlock,
  isHideListBlock,
  isHideVariableBlock,
  isInsertAtListBlock,
  isItemNumOfListBlock,
  isItemOfListBlock,
  isLengthOfListBlock,
  isListContainsItemBlock,
  isReplaceItemOfListBlock,
  isSetVariableToBlock,
  isShowListBlock,
  isShowVariableBlock,
  ItemNumOfListBlock,
  ItemOfListBlock,
  LengthOfListBlock,
  ListContainsItemBlock,
  ReplaceItemOfListBlock,
  SetVariableToBlock,
  ShowListBlock,
  ShowVariableBlock,
} from "src/ast/types/input/scratch/blocks/data";
import {
  createFunctionCallBlock,
  createFunctionCallExpressionBlock,
} from "./helpers";
import { ExpressionNode } from "src/ast/types/general-ast/ast-nodes/expression-node";

type DataCodeTreeNode = DataStatementBlock & TreeNode;
type DataExpressionTreeNode = DataExpressionBlock & TreeNode;

export const isDataStatementBlock = (
  block: NonHatBlock,
): block is DataStatementBlock =>
  isAddToListBlock(block) ||
  isChangeVariableByBlock(block) ||
  isDeleteAllOfListBlock(block) ||
  isDeleteOfListBlock(block) ||
  isHideListBlock(block) ||
  isHideVariableBlock(block) ||
  isInsertAtListBlock(block) ||
  isReplaceItemOfListBlock(block) ||
  isSetVariableToBlock(block) ||
  isShowListBlock(block) ||
  isShowVariableBlock(block);

export const isDataExpressionBlock = (
  block: NonHatBlock,
): block is DataExpressionBlock =>
  isItemOfListBlock(block) ||
  isItemNumOfListBlock(block) ||
  isLengthOfListBlock(block) ||
  isListContainsItemBlock(block);

export const convertDataBlockTreeToStatement = (
  dataBlock: DataCodeTreeNode,
): StatementNode[] =>
  match(dataBlock)
    .returnType<StatementNode[]>()
    .with(
      P.when(isAddToListBlock),
      P.when(isChangeVariableByBlock),
      P.when(isDeleteAllOfListBlock),
      P.when(isDeleteOfListBlock),
      P.when(isHideListBlock),
      P.when(isHideVariableBlock),
      P.when(isInsertAtListBlock),
      P.when(isReplaceItemOfListBlock),
      P.when(isSetVariableToBlock),
      P.when(isShowListBlock),
      P.when(isShowVariableBlock),
      (
        block: (
          | AddToListBlock
          | ChangeVariableByBlock
          | DeleteAllOfListBlock
          | DeleteOfListBlock
          | HideListBlock
          | HideVariableBlock
          | InsertAtListBlock
          | ReplaceItemOfListBlock
          | SetVariableToBlock
          | ShowListBlock
          | ShowVariableBlock
        ) &
          DataCodeTreeNode,
      ) => [createFunctionCallBlock(block)],
    )
    .exhaustive();

export const convertDataBlockTreeToExpression = (
  dataBlock: DataExpressionTreeNode,
): ExpressionNode =>
  match(dataBlock)
    .returnType<ExpressionNode>()
    .with(
      P.when(isItemNumOfListBlock),
      P.when(isItemOfListBlock),
      P.when(isLengthOfListBlock),
      P.when(isListContainsItemBlock),
      (
        block: (
          | ItemNumOfListBlock
          | ItemOfListBlock
          | LengthOfListBlock
          | ListContainsItemBlock
        ) &
          DataExpressionTreeNode,
      ) => createFunctionCallExpressionBlock(block),
    )
    .exhaustive();
