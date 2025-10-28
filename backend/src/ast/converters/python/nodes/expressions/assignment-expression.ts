import { AstNodeType } from "src/ast/types/general-ast";
import { ExpressionNodeType } from "src/ast/types/general-ast/ast-nodes/expression-node";
import { VariableAssignmentExpressionNode } from "src/ast/types/general-ast/ast-nodes/expression-node/assignment-node";
import { Assignment_expressionContext } from "../../generated/PythonParser";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";

export const convertAssignmentExpression = (
  visitor: IPythonAstVisitor,
  ctx: Assignment_expressionContext,
): PythonVisitorReturnValue => {
  const expression = visitor.getExpression(ctx.expression());

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.assignment,
      variable: {
        nodeType: AstNodeType.expression,
        expressionType: ExpressionNodeType.variable,
        name: ctx.name().getText(),
      },
      value: expression.node,
    } satisfies VariableAssignmentExpressionNode,
    functionDeclarations: expression.functionDeclarations,
  };
};
