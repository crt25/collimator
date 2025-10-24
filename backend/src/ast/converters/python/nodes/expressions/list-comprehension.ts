import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { ListcompContext } from "../../generated/PythonParser";
import { listComprehensionOperator } from "../../operators";

export const convertListComprehension = (
  visitor: IPythonAstVisitor,
  ctx: ListcompContext,
): PythonVisitorReturnValue => {
  const expression = visitor.getExpression(ctx.named_expression());
  const forIfClauses = visitor.getExpression(ctx.for_if_clauses());

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: listComprehensionOperator,
      operands: [expression.node, forIfClauses.node],
    } satisfies OperatorNode,
    functionDeclarations: [
      ...expression.functionDeclarations,
      ...forIfClauses.functionDeclarations,
    ],
  };
};
