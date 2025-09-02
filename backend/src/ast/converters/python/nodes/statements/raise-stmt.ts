import { AstNodeType } from "src/ast/types/general-ast";
import {
  FunctionCallNode,
  StatementNodeType,
} from "src/ast/types/general-ast/ast-nodes";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Raise_stmtContext } from "../../generated/PythonParser";

export const convertRaiseStmt = (
  visitor: IPythonAstVisitor,
  ctx: Raise_stmtContext,
): PythonVisitorReturnValue => {
  const { nodes, functionDeclarations } = visitor.getExpressions(
    ctx.expression_list(),
  );

  return {
    node: {
      nodeType: AstNodeType.statement,
      statementType: StatementNodeType.functionCall,
      name: "@raise",
      arguments: nodes,
    } satisfies FunctionCallNode,
    functionDeclarations,
  };
};
