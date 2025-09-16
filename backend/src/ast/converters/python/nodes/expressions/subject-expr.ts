import { AstNodeType } from "src/ast/types/general-ast";
import { ExpressionNodeType } from "src/ast/types/general-ast/ast-nodes/expression-node";
import { ExpressionSequenceNode } from "src/ast/types/general-ast/ast-nodes/expression-node/expression-sequence-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Subject_exprContext } from "../../generated/PythonParser";

export const convertSubjectExpr = (
  visitor: IPythonAstVisitor,
  ctx: Subject_exprContext,
): PythonVisitorReturnValue => {
  if (ctx.named_expression()) {
    return visitor.getExpression(ctx.named_expression());
  }

  const expr = visitor.getExpression(ctx.star_named_expression());
  if (!ctx.star_named_expressions()) {
    return {
      node: {
        nodeType: AstNodeType.expression,
        expressionType: ExpressionNodeType.sequence,
        expressions: [expr.node],
      } satisfies ExpressionSequenceNode,
      functionDeclarations: expr.functionDeclarations,
    };
  }

  const expressions = visitor.getExpression(ctx.star_named_expressions());
  if (expressions.node.expressionType !== ExpressionNodeType.sequence) {
    throw new Error("Expected expression sequence for star_named_expressions");
  }

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.sequence,
      expressions: [expr.node, ...expressions.node.expressions],
    } satisfies ExpressionSequenceNode,
    functionDeclarations: [
      ...expr.functionDeclarations,
      ...expressions.functionDeclarations,
    ],
  };
};
