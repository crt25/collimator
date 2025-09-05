import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Type_aliasContext } from "../../generated/PythonParser";

export const convertTypeAlias = (
  _visitor: IPythonAstVisitor,
  _ctx: Type_aliasContext,
): PythonVisitorReturnValue => {
  // type annotations are currently not translated
  return { functionDeclarations: [] };
};
