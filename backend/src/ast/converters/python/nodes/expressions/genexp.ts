import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { GenexpContext } from "../../generated/PythonParser";
import { generatorExpressionOperator } from "../../operators";

export const convertGenexp = (
  visitor: IPythonAstVisitor,
  ctx: GenexpContext,
): PythonVisitorReturnValue => {
  const expression = visitor.getExpression(
    ctx.assignment_expression() ?? ctx.expression(),
  );
  const forIfClauses = visitor.getExpression(ctx.for_if_clauses());

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: generatorExpressionOperator,
      operands: [expression.node, forIfClauses.node],
    } satisfies OperatorNode,
    functionDeclarations: [
      ...expression.functionDeclarations,
      ...forIfClauses.functionDeclarations,
    ],
  };
};
