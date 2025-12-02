import { AstNodeType } from "src/ast/types/general-ast";
import { ExpressionNodeType } from "src/ast/types/general-ast/ast-nodes/expression-node";
import { ExpressionSequenceNode } from "src/ast/types/general-ast/ast-nodes/expression-node/expression-sequence-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { For_if_clausesContext } from "../../generated/PythonParser";

export const convertForIfClauses = (
  visitor: IPythonAstVisitor,
  ctx: For_if_clausesContext,
): PythonVisitorReturnValue => {
  const forIfClauses = visitor.getExpressions(ctx.for_if_clause_list());

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.sequence,
      expressions: forIfClauses.nodes,
    } satisfies ExpressionSequenceNode,
    functionDeclarations: forIfClauses.functionDeclarations,
  };
};
