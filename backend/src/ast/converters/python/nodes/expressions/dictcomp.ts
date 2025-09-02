import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { DictcompContext } from "../../generated/PythonParser";

export const convertDictcomp = (
  visitor: IPythonAstVisitor,
  ctx: DictcompContext,
): PythonVisitorReturnValue => {
  const expression = visitor.getExpression(ctx.kvpair());
  const forIfClauses = visitor.getExpression(ctx.for_if_clauses());

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: "dict-comprehension",
      operands: [expression.node, forIfClauses.node],
    } satisfies OperatorNode,
    functionDeclarations: [
      ...expression.functionDeclarations,
      ...forIfClauses.functionDeclarations,
    ],
  };
};
