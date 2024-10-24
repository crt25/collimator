import { StatementNode } from "src/ast/types/general-ast/ast-nodes";
import { match, P } from "ts-pattern";
import { NonHatBlock, TreeNode } from "./types";
import { createFunctionCallBlock } from "./helpers";
import { ExpressionNode } from "src/ast/types/general-ast/ast-nodes/expression-node";
import {
  ExtensionExpressionBlock,
  ExtensionStatementBlock,
} from "src/ast/types/input/scratch/blocks/extensions";
import {
  ArbitraryFunctionCallBlock,
  isArbitraryStatementBlock,
} from "src/ast/types/input/scratch/blocks/extensions/arbitrary-function-call-block";

type ExtensionStatementTreeNode = ExtensionStatementBlock & TreeNode;
type ExtensionExpressionTreeNode = ExtensionExpressionBlock & TreeNode;

export const isExtensionStatementBlock = (
  block: NonHatBlock,
): block is ExtensionStatementBlock & NonHatBlock =>
  isArbitraryStatementBlock(block);

export const isExtensionExpressionBlock = (
  block: NonHatBlock,
): block is ExtensionExpressionTreeNode => false;

export const convertExtensionBlockTreeToStatement = (
  extensionBlock: ExtensionStatementTreeNode,
): StatementNode[] =>
  match(extensionBlock)
    .returnType<StatementNode[]>()
    .with(
      P.when(isArbitraryStatementBlock),
      (block: ArbitraryFunctionCallBlock & ExtensionStatementTreeNode) => {
        const splitOpCode = block.opcode.split("_");

        return [
          createFunctionCallBlock(block, `${splitOpCode[0]}_${splitOpCode[2]}`),
        ];
      },
    )
    .exhaustive();

export const convertExtensionBlockTreeToExpression = (
  extensionBlock: ExtensionExpressionTreeNode,
): ExpressionNode =>
  match(extensionBlock).returnType<ExpressionNode>().exhaustive();
