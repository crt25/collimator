import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNode,
  ExpressionNodeType,
  LiteralNode,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { FunctionDeclarationNode } from "src/ast/types/general-ast/ast-nodes";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import {
  Fstring_conversionContext,
  Fstring_full_format_specContext,
  Fstring_replacement_fieldContext,
} from "../../generated/PythonParser";

export const convertFstringReplacementField = (
  visitor: IPythonAstVisitor,
  ctx: Fstring_replacement_fieldContext,
): PythonVisitorReturnValue => {
  const functionDeclarations: FunctionDeclarationNode[] = [];
  const operands: ExpressionNode[] = [];

  const annotatedRhs = visitor.getExpression(ctx.annotated_rhs());
  operands.push(annotatedRhs.node);
  functionDeclarations.push(...annotatedRhs.functionDeclarations);

  if (ctx.EQUAL()) {
    operands.push({
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.literal,
      type: "string",
      value: "=",
    } satisfies LiteralNode);
  }

  const fStringConversion = ctx.fstring_conversion() as
    | Fstring_conversionContext
    | undefined;

  if (fStringConversion) {
    const conversion = visitor.getExpression(fStringConversion);

    operands.push(conversion.node);
    functionDeclarations.push(...conversion.functionDeclarations);
  }

  const fStringFullFormatSpec = ctx.fstring_full_format_spec() as
    | Fstring_full_format_specContext
    | undefined;

  if (fStringFullFormatSpec) {
    const spec = visitor.getExpression(fStringFullFormatSpec);

    operands.push(spec.node);
    functionDeclarations.push(...spec.functionDeclarations);
  }

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: "fstring_replacement_field",
      operands,
    } satisfies OperatorNode,
    functionDeclarations,
  };
};
