import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  LiteralNode,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import {
  NameContext,
  Star_atomContext,
  Target_with_star_atomContext,
} from "../../generated/PythonParser";

export const convertTargetWithStarAtom = (
  visitor: IPythonAstVisitor,
  ctx: Target_with_star_atomContext,
): PythonVisitorReturnValue => {
  const starAtom = ctx.star_atom() as Star_atomContext | undefined;
  if (starAtom) {
    return visitor.visit(starAtom);
  }

  const primaryTarget = visitor.getExpression(ctx.t_primary());
  const name = ctx.name() as NameContext | undefined;

  if (name) {
    return {
      node: {
        nodeType: AstNodeType.expression,
        expressionType: ExpressionNodeType.operator,
        operator: ".",
        operands: [
          primaryTarget.node,
          {
            nodeType: AstNodeType.expression,
            expressionType: ExpressionNodeType.literal,
            type: "string",
            value: name.getText(),
          } satisfies LiteralNode,
        ],
      } satisfies OperatorNode,
      functionDeclarations: primaryTarget.functionDeclarations,
    };
  }

  const slices = visitor.getExpression(ctx.slices());

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: "slice",
      operands: [primaryTarget.node, slices.node],
    } satisfies OperatorNode,
    functionDeclarations: [
      ...primaryTarget.functionDeclarations,
      ...slices.functionDeclarations,
    ],
  };
};
