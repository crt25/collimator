import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Func_type_commentContext } from "../../generated/PythonParser";

export const convertFuncTypeComment = (
  _visitor: IPythonAstVisitor,
  _ctx: Func_type_commentContext,
): PythonVisitorReturnValue => {
  // type annotations are currently not translated
  return { functionDeclarations: [] };
};
