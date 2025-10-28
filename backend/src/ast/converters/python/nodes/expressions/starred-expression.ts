import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Starred_expressionContext } from "../../generated/PythonParser";
import { unpackOperator } from "../../operators";

export const convertStarredExpression = (
  visitor: IPythonAstVisitor,
  ctx: Starred_expressionContext,
): PythonVisitorReturnValue => {
  const exp = visitor.getExpression(ctx.expression());

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: unpackOperator,
      operands: [exp.node],
    } satisfies OperatorNode,
    functionDeclarations: exp.functionDeclarations,
  };
};
