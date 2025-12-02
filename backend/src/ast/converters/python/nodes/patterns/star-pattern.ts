import {
  ExpressionNodeType,
  LiteralNode,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { AstNodeType } from "src/ast/types/general-ast";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Star_patternContext } from "../../generated/PythonParser";
import { starPatternOperator } from "../../operators";

export const convertStarPattern = (
  _visitor: IPythonAstVisitor,
  ctx: Star_patternContext,
): PythonVisitorReturnValue => ({
  node: {
    nodeType: AstNodeType.expression,
    expressionType: ExpressionNodeType.operator,
    operator: starPatternOperator,
    operands: [
      {
        nodeType: AstNodeType.expression,
        expressionType: ExpressionNodeType.literal,
        type: "string",
        value: ctx.name().getText(),
      } satisfies LiteralNode,
    ],
  } satisfies OperatorNode,
  functionDeclarations: [],
});
