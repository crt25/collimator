import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { Type_param_seqContext } from "../../generated/PythonParser";
import { convertTypeParam, GenericTypeParameter } from "./type-param";

export const convertTypeParamSeq = (
  visitor: IPythonAstVisitor,
  ctx: Type_param_seqContext,
): GenericTypeParameter[] =>
  ctx.type_param_list().map((param) => convertTypeParam(visitor, param));
