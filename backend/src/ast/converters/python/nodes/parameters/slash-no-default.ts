import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { Slash_no_defaultContext } from "../../generated/PythonParser";
import { Parameter } from "./param";
import { convertParamNoDefault } from "./param-no-default";

export const convertSlashNoDefault = (
  visitor: IPythonAstVisitor,
  ctx: Slash_no_defaultContext,
): Parameter[] =>
  ctx
    .param_no_default_list()
    .map((param) => convertParamNoDefault(visitor, param));
