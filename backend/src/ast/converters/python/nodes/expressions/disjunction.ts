import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { DisjunctionContext } from "../../generated/PythonParser";

export const convertDisjunction = (
  visitor: IPythonAstVisitor,
  ctx: DisjunctionContext,
): PythonVisitorReturnValue => {
  const conjunctions = visitor.getExpressions(ctx.conjunction_list());

  if (conjunctions.nodes.length === 0) {
    throw new Error("Cannot convert disjunction, no conjunctions found.");
  }

  if (conjunctions.nodes.length === 1) {
    return {
      node: conjunctions.nodes[0],
      functionDeclarations: conjunctions.functionDeclarations,
    };
  }

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: "or",
      operands: conjunctions.nodes,
    } satisfies OperatorNode,
    functionDeclarations: conjunctions.functionDeclarations,
  };
};
