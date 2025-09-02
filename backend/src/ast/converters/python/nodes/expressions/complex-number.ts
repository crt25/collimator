import {
  ExpressionNodeType,
  LiteralNode,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { AstNodeType } from "src/ast/types/general-ast";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Complex_numberContext } from "../../generated/PythonParser";

export const convertComplexNumber = (
  visitor: IPythonAstVisitor,
  ctx: Complex_numberContext,
): PythonVisitorReturnValue => {
  const real = visitor.getExpression(ctx.signed_real_number());
  const imaginary = visitor.getExpression(ctx.imaginary_number());

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: "complex-number",
      operands: [
        real.node,
        {
          nodeType: AstNodeType.expression,
          expressionType: ExpressionNodeType.literal,
          type: "string",
          value: (ctx.PLUS() ?? ctx.MINUS()).getText(),
        } satisfies LiteralNode,
        imaginary.node,
      ],
    } satisfies OperatorNode,
    functionDeclarations: [
      ...real.functionDeclarations,
      ...imaginary.functionDeclarations,
    ],
  };
};
