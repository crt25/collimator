import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Group_patternContext } from "../../generated/PythonParser";

export const convertGroupPattern = (
  visitor: IPythonAstVisitor,
  ctx: Group_patternContext,
): PythonVisitorReturnValue => {
  const pattern = visitor.getExpression(ctx.pattern());

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: "group-pattern",
      operands: [pattern.node],
    } satisfies OperatorNode,
    functionDeclarations: pattern.functionDeclarations,
  };
};
