import { AstNodeType } from "src/ast/types/general-ast";
import {
  ConditionNode,
  LoopNode,
  StatementNodeType,
} from "src/ast/types/general-ast/ast-nodes";
import {
  ExpressionNode,
  ExpressionNodeType,
  FunctionCallExpressionNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { StatementSequenceNode } from "src/ast/types/general-ast/ast-nodes/statement-node/statement-sequence-node";
import {
  Else_blockContext,
  For_stmtContext,
} from "../../generated/PythonParser";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";

export const convertForStmt = (
  visitor: IPythonAstVisitor,
  ctx: For_stmtContext,
): PythonVisitorReturnValue => {
  const isAsync = ctx.ASYNC() ? true : false;
  const iterationOperator = isAsync ? "async for" : "for";

  const body = visitor.getStatementSequence([ctx.block()]);
  const variable = visitor.getExpression(ctx.star_targets());
  const list = visitor.getExpression(ctx.star_expressions());

  const loopNode = {
    nodeType: AstNodeType.statement,
    statementType: StatementNodeType.loop,
    condition: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: iterationOperator,
      operands: [variable.node, list.node],
    } satisfies ExpressionNode,
    body: body.node,
  } satisfies LoopNode;

  const elseBlock = ctx.else_block() as Else_blockContext | undefined;
  if (elseBlock) {
    const afterLoop = visitor.getStatementSequence([ctx.else_block()]);

    return {
      node: {
        nodeType: AstNodeType.statement,
        statementType: StatementNodeType.sequence,
        statements: [
          loopNode,
          {
            nodeType: AstNodeType.statement,
            statementType: StatementNodeType.condition,
            condition: {
              nodeType: AstNodeType.expression,
              expressionType: ExpressionNodeType.functionCall,
              name: "@last-loop-finished",
              arguments: [],
            } satisfies FunctionCallExpressionNode,
            whenTrue: afterLoop.node,
            whenFalse: {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.sequence,
              statements: [],
            } satisfies StatementSequenceNode,
          } satisfies ConditionNode,
        ],
      } satisfies StatementSequenceNode,
      functionDeclarations: [
        ...variable.functionDeclarations,
        ...list.functionDeclarations,
        ...body.functionDeclarations,
        ...afterLoop.functionDeclarations,
      ],
    };
  }

  return {
    node: loopNode,
    functionDeclarations: [
      ...variable.functionDeclarations,
      ...list.functionDeclarations,
      ...body.functionDeclarations,
    ],
  };
};
