import {
  FunctionCallNode,
  StatementNodeType,
} from "src/ast/types/general-ast/ast-nodes";
import { AstNodeType } from "src/ast/types/general-ast";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Assert_stmtContext } from "../../generated/PythonParser";
import { syntheticAstFunctionPrefix } from "../../constants";

export const convertAssertStmt = (
  visitor: IPythonAstVisitor,
  ctx: Assert_stmtContext,
): PythonVisitorReturnValue => {
  const { nodes, functionDeclarations } = visitor.getExpressions(
    ctx.expression_list(),
  );

  return {
    node: {
      nodeType: AstNodeType.statement,
      statementType: StatementNodeType.functionCall,
      name: `${syntheticAstFunctionPrefix}assert`,
      arguments: nodes,
    } satisfies FunctionCallNode,
    functionDeclarations,
  };
};
