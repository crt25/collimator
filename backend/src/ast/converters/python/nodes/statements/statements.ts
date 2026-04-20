import { StatementsContext } from "../../generated/PythonParser";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";

export const convertStatements = (
  visitor: IPythonAstVisitor,
  ctx: StatementsContext,
): PythonVisitorReturnValue => {
  const statementList = ctx.statement_list();

  if (!statementList) {
    return visitor.getStatements([]);
  }

  return visitor.getStatements(statementList);
};
