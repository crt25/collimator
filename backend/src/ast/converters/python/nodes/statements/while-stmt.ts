import { AstNodeType } from "src/ast/types/general-ast";
import {
  ConditionNode,
  LoopNode,
  StatementNodeType,
} from "src/ast/types/general-ast/ast-nodes";
import { StatementSequenceNode } from "src/ast/types/general-ast/ast-nodes/statement-node/statement-sequence-node";
import {
  ExpressionNodeType,
  FunctionCallExpressionNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import {
  Else_blockContext,
  While_stmtContext,
} from "../../generated/PythonParser";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { syntheticAstFunctionPrefix } from "../../constants";

export const convertWhileStmt = (
  visitor: IPythonAstVisitor,
  ctx: While_stmtContext,
): PythonVisitorReturnValue => {
  const condition = visitor.getExpression(ctx.named_expression());
  const body = visitor.getStatementSequence([ctx.block()]);

  const loopNode = {
    nodeType: AstNodeType.statement,
    statementType: StatementNodeType.loop,
    condition: condition.node,
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
              name: `${syntheticAstFunctionPrefix}last-loop-finished`,
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
        ...condition.functionDeclarations,
        ...body.functionDeclarations,
        ...afterLoop.functionDeclarations,
      ],
    };
  }

  return {
    node: loopNode,
    functionDeclarations: [
      ...condition.functionDeclarations,
      ...body.functionDeclarations,
    ],
  };
};
