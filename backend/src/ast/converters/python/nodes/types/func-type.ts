import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Func_typeContext } from "../../generated/PythonParser";

export const convertFuncType = (
  _visitor: IPythonAstVisitor,
  _ctx: Func_typeContext,
): PythonVisitorReturnValue => {
  // type annotations are currently not translated
  return { functionDeclarations: [] };
};
