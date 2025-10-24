import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { AstNodeType } from "src/ast/types/general-ast";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { With_itemContext } from "../../generated/PythonParser";
import { withItemOperator } from "../../operators";

export const convertWithItem = (
  visitor: IPythonAstVisitor,
  ctx: With_itemContext,
): PythonVisitorReturnValue => {
  const exp = visitor.getExpression(ctx.expression());
  if (!ctx.AS()) {
    return exp;
  }

  const target = visitor.getExpression(ctx.star_target());

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: withItemOperator,
      operands: [exp.node, target.node],
    } satisfies OperatorNode,
    functionDeclarations: [
      ...exp.functionDeclarations,
      ...target.functionDeclarations,
    ],
  };
};
