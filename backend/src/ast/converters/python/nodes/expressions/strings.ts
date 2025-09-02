import { AstNodeType } from "src/ast/types/general-ast";
import {
  ExpressionNodeType,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { ParserRuleContext } from "antlr4";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { StringsContext } from "../../generated/PythonParser";

export const convertStrings = (
  visitor: IPythonAstVisitor,
  ctx: StringsContext,
): PythonVisitorReturnValue => {
  const { nodes: strings, functionDeclarations } = visitor.getExpressions(
    (ctx.children ?? []).filter((c) => c instanceof ParserRuleContext),
  );

  if (strings.length === 1) {
    return {
      node: strings[0],
      functionDeclarations,
    };
  }

  return {
    node: {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.operator,
      operator: "concat",
      operands: strings,
    } satisfies OperatorNode,
    functionDeclarations,
  };
};
