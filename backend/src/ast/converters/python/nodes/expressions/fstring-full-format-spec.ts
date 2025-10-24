import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Fstring_full_format_specContext } from "../../generated/PythonParser";
import { fStringFormatSpecOperator } from "../../operators";

export const convertFstringFullFormatSpec = (
  visitor: IPythonAstVisitor,
  ctx: Fstring_full_format_specContext,
): PythonVisitorReturnValue => {
  const specs = visitor.getExpressions(ctx.fstring_format_spec_list());

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: fStringFormatSpecOperator,
      operands: specs.nodes,
    } satisfies OperatorNode,
    functionDeclarations: specs.functionDeclarations,
  };
};
