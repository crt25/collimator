import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import {
  Kwarg_or_starredContext,
  NameContext,
} from "../../generated/PythonParser";
import { PythonFunctionArgument } from "./args";

export const convertKwargOrStarred = (
  visitor: IPythonAstVisitor,
  ctx: Kwarg_or_starredContext,
): PythonFunctionArgument => {
  const name = ctx.name() as NameContext | undefined;

  if (name) {
    return {
      name: name.getText(),
      expression: visitor.getExpression(ctx.expression()).node,
    };
  }

  // The grammar's other alternative: a starred_expression (`*args` appearing
  // after a keyword argument has started the kwargs list). expression() is
  // null here; visiting the starred expression produces the same unpack
  // operator as a plain `f(*args)` call.
  return {
    name: null,
    expression: visitor.getExpression(ctx.starred_expression()).node,
  };
};
