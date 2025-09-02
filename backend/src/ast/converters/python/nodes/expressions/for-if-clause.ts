import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { For_if_clauseContext } from "../../generated/PythonParser";

export const convertForIfClause = (
  visitor: IPythonAstVisitor,
  ctx: For_if_clauseContext,
): PythonVisitorReturnValue => {
  const targets = visitor.getExpression(ctx.star_targets());

  const disjunctions = visitor.getExpressions(ctx.disjunction_list());
  const value = disjunctions.nodes[0];
  const conditions = disjunctions.nodes.slice(1);

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: ctx.ASYNC() ? "async-for-if-clause" : "for-if-clause",
      operands: [targets.node, value, ...conditions],
    } satisfies OperatorNode,
    functionDeclarations: disjunctions.functionDeclarations,
  };
};
