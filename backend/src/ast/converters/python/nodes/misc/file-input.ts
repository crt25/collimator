import { File_inputContext } from "../../generated/PythonParser";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";

export const convertFileInput = (
  visitor: IPythonAstVisitor,
  ctx: File_inputContext,
): PythonVisitorReturnValue => {
  const statements = ctx.statements();

  if (!statements) {
    return visitor.getStatements([]);
  }

  return visitor.getStatements(statements.statement_list());
};
