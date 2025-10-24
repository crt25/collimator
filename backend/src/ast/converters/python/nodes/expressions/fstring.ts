import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  LiteralNode,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { FstringContext } from "../../generated/PythonParser";
import { fStringOperator } from "../../operators";

export const convertFstring = (
  visitor: IPythonAstVisitor,
  ctx: FstringContext,
): PythonVisitorReturnValue => {
  const strings = visitor.getExpressions(ctx.fstring_middle_list());

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: fStringOperator,
      operands: [
        {
          nodeType: AstNodeType.expression,
          expressionType: ExpressionNodeType.literal,
          type: "string",
          value: ctx.FSTRING_START().getText(),
        } satisfies LiteralNode,
        {
          nodeType: AstNodeType.expression,
          expressionType: ExpressionNodeType.literal,
          type: "string",
          value: ctx.FSTRING_END().getText(),
        } satisfies LiteralNode,
        ...strings.nodes,
      ],
    } satisfies OperatorNode,
    functionDeclarations: strings.functionDeclarations,
  };
};
