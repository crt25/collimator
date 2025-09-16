import { AstNode, AstNodeType, GeneralAst, StatementNode } from "..";
import {
  ExpressionNode,
  ExpressionNodeType,
  VariableNode,
} from "../ast-nodes/expression-node";

export const isSingleNode = (
  node: AstNode | undefined,
): node is Exclude<AstNode, GeneralAst> =>
  !Array.isArray(node) && node !== undefined;

export const isStatementNode = (
  node: AstNode | undefined,
): node is StatementNode =>
  isSingleNode(node) && node.nodeType === AstNodeType.statement;

export const isExpressionNode = (
  node: AstNode | undefined,
): node is ExpressionNode =>
  isSingleNode(node) && node.nodeType === AstNodeType.expression;

export const isVariableNode = (
  node: AstNode | undefined,
): node is VariableNode =>
  isExpressionNode(node) && node.expressionType === ExpressionNodeType.variable;
