import {
  ExpressionNodeType,
  LiteralNode,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { AstNodeType } from "src/ast/types/general-ast";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Single_subscript_attribute_targetContext } from "../../generated/PythonParser";
import { fieldAccessOperator, sliceOperator } from "../../operators";

export const convertSingleSubscriptAttributeTarget = (
  visitor: IPythonAstVisitor,
  ctx: Single_subscript_attribute_targetContext,
): PythonVisitorReturnValue => {
  const primary = visitor.getExpression(ctx.t_primary());

  if (ctx.DOT()) {
    return {
      node: {
        nodeType: AstNodeType.expression,
        expressionType: ExpressionNodeType.operator,
        operator: fieldAccessOperator,
        operands: [
          primary.node,
          {
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.literal,
            type: "string",
            value: ctx.name().getText(),
          } as LiteralNode,
        ],
      } satisfies OperatorNode,
      functionDeclarations: primary.functionDeclarations,
    };
  }

  const slices = visitor.getExpression(ctx.slices());

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: sliceOperator,
      operands: [primary.node, slices.node],
    } satisfies OperatorNode,
    functionDeclarations: [
      ...primary.functionDeclarations,
      ...slices.functionDeclarations,
    ],
  };
};
