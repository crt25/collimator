import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { ArgumentsContext } from "../../generated/PythonParser";
import { convertArgs, PythonFunctionArguments } from "./args";

export const convertArguments = (
  visitor: IPythonAstVisitor,
  ctx: ArgumentsContext,
): PythonFunctionArguments => convertArgs(visitor, ctx.args());
