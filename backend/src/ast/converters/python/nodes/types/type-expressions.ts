import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Type_expressionsContext } from "../../generated/PythonParser";

export const convertTypeExpressions = (
  _visitor: IPythonAstVisitor,
  _ctx: Type_expressionsContext,
): PythonVisitorReturnValue => {
  // type annotations are currently not translated
  return { functionDeclarations: [] };
};
