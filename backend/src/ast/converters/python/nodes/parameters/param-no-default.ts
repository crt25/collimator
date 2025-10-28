import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { Param_no_defaultContext } from "../../generated/PythonParser";
import { convertParam, Parameter } from "./param";

export const convertParamNoDefault = (
  visitor: IPythonAstVisitor,
  ctx: Param_no_defaultContext,
): Parameter => convertParam(visitor, ctx.param());
