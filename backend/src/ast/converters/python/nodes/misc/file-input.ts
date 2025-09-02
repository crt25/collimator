import { File_inputContext } from "../../generated/PythonParser";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";

export const convertFileInput = (
  visitor: IPythonAstVisitor,
  ctx: File_inputContext,
): PythonVisitorReturnValue =>
  visitor.getStatements(ctx.statements().statement_list());
