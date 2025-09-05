import { AstNodeType } from "src/ast/types/general-ast";
import {
  FunctionCallNode,
  StatementNodeType,
} from "src/ast/types/general-ast/ast-nodes";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Del_stmtContext } from "../../generated/PythonParser";

export const convertDelStmt = (
  visitor: IPythonAstVisitor,
  ctx: Del_stmtContext,
): PythonVisitorReturnValue => {
  const expression = visitor.getExpression(ctx.del_targets());

  return {
    node: {
      nodeType: AstNodeType.statement,
      statementType: StatementNodeType.functionCall,
      name: "@delete",
      arguments: [expression.node],
    } satisfies FunctionCallNode,
    functionDeclarations: expression.functionDeclarations,
  };
};
