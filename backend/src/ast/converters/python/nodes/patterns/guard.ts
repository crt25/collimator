import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { AstNodeType } from "src/ast/types/general-ast";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { GuardContext } from "../../generated/PythonParser";

export const convertGuard = (
  visitor: IPythonAstVisitor,
  ctx: GuardContext,
): PythonVisitorReturnValue => {
  const expression = visitor.getExpression(ctx.named_expression());

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: "guard",
      operands: [expression.node],
    } satisfies OperatorNode,
    functionDeclarations: expression.functionDeclarations,
  };
};
