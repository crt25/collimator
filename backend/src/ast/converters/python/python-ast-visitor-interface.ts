import { ParserRuleContext } from "antlr4";

import { ExpressionNode } from "src/ast/types/general-ast/ast-nodes/expression-node";
import {
  FunctionDeclarationNode,
  StatementNode,
} from "src/ast/types/general-ast/ast-nodes";
import { StatementSequenceNode } from "src/ast/types/general-ast/ast-nodes/statement-node/statement-sequence-node";
import { PythonVisitorReturnValue } from "./python-ast-visitor-return-value";
import PythonParserVisitor from "./generated/PythonParserVisitor";

export interface IPythonAstVisitor
  extends PythonParserVisitor<PythonVisitorReturnValue> {
  getExpression(
    ctx: ParserRuleContext,
  ): PythonVisitorReturnValue & { node: ExpressionNode };

  getExpressions(ctxs?: ParserRuleContext[]): {
    nodes: ExpressionNode[];
    functionDeclarations: FunctionDeclarationNode[];
  };

  getStatementSequence(
    children: (ParserRuleContext | undefined)[],
  ): PythonVisitorReturnValue & {
    node: StatementSequenceNode;
  };

  getStatements(
    children: (ParserRuleContext | undefined)[],
  ): PythonVisitorReturnValue & {
    node: StatementNode;
  };

  visitChildren(ctx: ParserRuleContext): PythonVisitorReturnValue;
}
