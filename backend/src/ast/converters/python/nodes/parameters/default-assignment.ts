import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Default_assignmentContext } from "../../generated/PythonParser";

export const convertDefaultAssignment = (
  visitor: IPythonAstVisitor,
  ctx: Default_assignmentContext,
): PythonVisitorReturnValue => visitor.getExpression(ctx.expression());
