import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  LiteralNode,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import {
  Del_t_atomContext,
  Del_targetContext,
} from "../../generated/PythonParser";

export const convertDelTarget = (
  visitor: IPythonAstVisitor,
  ctx: Del_targetContext,
): PythonVisitorReturnValue => {
  const delAtom = ctx.del_t_atom() as Del_t_atomContext | undefined;
  if (delAtom) {
    return visitor.getExpression(delAtom);
  }

  const primary = visitor.getExpression(ctx.t_primary());

  if (ctx.name()) {
    return {
      node: {
        nodeType: AstNodeType.expression,
        expressionType: ExpressionNodeType.operator,
        operator: ".",
        operands: [
          primary.node,
          {
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.literal,
            type: "string",
            value: ctx.name().getText(),
          } satisfies LiteralNode,
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
      operator: "slice",
      operands: [primary.node, slices.node],
    } satisfies OperatorNode,
    functionDeclarations: [
      ...primary.functionDeclarations,
      ...slices.functionDeclarations,
    ],
  };
};
