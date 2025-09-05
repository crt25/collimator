import { ExpressionNode } from "src/ast/types/general-ast/ast-nodes/expression-node";
import { isExpressionNode } from "src/ast/types/general-ast/helpers/node-type-checks";
import { ParserRuleContext } from "antlr4";
import { ArgsContext, KwargsContext } from "../../generated/PythonParser";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { UnexpectedResultError } from "../unexpected-result-error";
import { convertKwargs } from "./kwargs";

export type PythonFunctionArgument = {
  name: string | null;
  expression: ExpressionNode;
};

export type PythonFunctionArguments = {
  unnamed: ExpressionNode[];
  named: {
    name: string;
    expression: ExpressionNode;
  }[];
};

export const convertArgs = (
  visitor: IPythonAstVisitor,
  ctx: ArgsContext,
): PythonFunctionArguments => {
  const starredExpressions = ctx.starred_expression_list();
  const assignmentExpressions = ctx.assignment_expression_list();
  const expressions = ctx.expression_list();

  const keywordArguments = ctx.kwargs() as KwargsContext | undefined;
  const args = keywordArguments
    ? convertKwargs(visitor, keywordArguments)
    : { unnamed: [], named: [] };

  if (
    starredExpressions.length > 0 ||
    assignmentExpressions.length > 0 ||
    expressions.length > 0
  ) {
    // https://github.com/antlr/grammars-v4/blob/master/python/python3_13/PythonParser.g4#L776C7-L776C150
    const unnamedArgumentsInOrder = (ctx.children ?? [])
      .filter(
        (c) => c instanceof ParserRuleContext && !(c instanceof KwargsContext),
      )
      .map((v) => visitor.visit(v));

    const nodes = unnamedArgumentsInOrder.map((c) => c.node);

    if (!nodes.every((a) => isExpressionNode(a))) {
      throw UnexpectedResultError.unexpectedNonExpressions(
        unnamedArgumentsInOrder.filter((a) => !isExpressionNode(a.node)),
      );
    }

    args.unnamed = [...nodes, ...args.unnamed];
  }

  return args;
};
