import { ExpressionSequenceNode } from "src/ast/types/general-ast/ast-nodes/expression-node/expression-sequence-node";
import { AstNodeType } from "src/ast/types/general-ast";
import { ExpressionNodeType } from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { ExpressionsContext } from "../../generated/PythonParser";

export const convertExpressions = (
  visitor: IPythonAstVisitor,
  ctx: ExpressionsContext,
): PythonVisitorReturnValue => {
  const { nodes, functionDeclarations } = visitor.getExpressions(
    ctx.expression_list(),
  );

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.sequence,
      expressions: nodes,
    } satisfies ExpressionSequenceNode,
    functionDeclarations,
  };
};
