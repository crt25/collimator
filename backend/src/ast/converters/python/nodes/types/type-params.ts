import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { Type_paramsContext } from "../../generated/PythonParser";
import { convertTypeParamSeq } from "./type-param-seq";
import { GenericTypeParameter } from "./type-param";

export const convertTypeParams = (
  visitor: IPythonAstVisitor,
  ctx: Type_paramsContext,
): GenericTypeParameter[] => convertTypeParamSeq(visitor, ctx.type_param_seq());
