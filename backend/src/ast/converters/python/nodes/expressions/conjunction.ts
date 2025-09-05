import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { ConjunctionContext } from "../../generated/PythonParser";

export const convertConjunction = (
  visitor: IPythonAstVisitor,
  ctx: ConjunctionContext,
): PythonVisitorReturnValue => {
  const inversions = visitor.getExpressions(ctx.inversion_list());

  if (inversions.nodes.length === 0) {
    throw new Error("Cannot convert conjunction, no inversions found.");
  }

  if (inversions.nodes.length === 1) {
    return {
      node: inversions.nodes[0],
      functionDeclarations: inversions.functionDeclarations,
    };
  }

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: "and",
      operands: inversions.nodes,
    } satisfies OperatorNode,
    functionDeclarations: inversions.functionDeclarations,
  };
};
