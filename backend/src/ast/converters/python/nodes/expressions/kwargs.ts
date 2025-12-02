import { ExpressionNode } from "src/ast/types/general-ast/ast-nodes/expression-node";
import { ParserRuleContext } from "antlr4";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import {
  Kwarg_or_double_starredContext,
  Kwarg_or_starredContext,
  KwargsContext,
} from "../../generated/PythonParser";
import { convertKwargOrStarred } from "./kwarg-or-starred";
import { convertKwargOrDoubleStarred } from "./kwarg-or-double-starred";
import { PythonFunctionArguments } from "./args";

export const convertKwargs = (
  visitor: IPythonAstVisitor,
  ctx: KwargsContext,
): PythonFunctionArguments => {
  const children = (ctx.children ?? [])
    .filter((c) => c instanceof ParserRuleContext)
    .map((child) => {
      if (child instanceof Kwarg_or_starredContext) {
        return convertKwargOrStarred(visitor, child);
      }

      if (child instanceof Kwarg_or_double_starredContext) {
        return convertKwargOrDoubleStarred(visitor, child);
      }

      throw new Error(`Unexpected child type: ${child.constructor.name}`);
    });

  const unnamed = children
    .filter((c) => c.name === null)
    .map((c) => c.expression);

  const named = children.filter(
    (
      c,
    ): c is {
      name: string;
      expression: ExpressionNode;
    } => c.name !== null,
  );

  return {
    unnamed,
    named,
  };
};
