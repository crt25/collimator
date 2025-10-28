import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { Slash_with_defaultContext } from "../../generated/PythonParser";
import { convertParamWithDefault } from "./param-with-default";
import { convertParamNoDefault } from "./param-no-default";
import { Parameter } from "./param";

export const convertSlashWithDefault = (
  visitor: IPythonAstVisitor,
  ctx: Slash_with_defaultContext,
): Parameter[] => [
  ...ctx
    .param_no_default_list()
    .map((param) => convertParamNoDefault(visitor, param))
    .map((p) => ({ ...p, defaultValue: null })),
  ...ctx
    .param_with_default_list()
    .map((param) => convertParamWithDefault(visitor, param)),
];
