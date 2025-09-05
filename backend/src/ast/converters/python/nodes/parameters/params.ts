import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { ParamsContext } from "../../generated/PythonParser";
import { convertParameters } from "./parameters";
import { Parameter } from "./param";

export const convertParams = (
  visitor: IPythonAstVisitor,
  ctx: ParamsContext,
): Parameter[] => convertParameters(visitor, ctx.parameters());
