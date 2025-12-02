import { AstNodeType } from "src/ast/types/general-ast";
import {
  FunctionCallNode,
  StatementNodeType,
} from "src/ast/types/general-ast/ast-nodes";
import {
  ExpressionNodeType,
  LiteralNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Nonlocal_stmtContext } from "../../generated/PythonParser";
import { syntheticAstFunctionPrefix } from "../../constants";

export const convertNonlocalStmt = (
  _visitor: IPythonAstVisitor,
  ctx: Nonlocal_stmtContext,
): PythonVisitorReturnValue => ({
  node: {
    nodeType: AstNodeType.statement,
    statementType: StatementNodeType.functionCall,
    name: `${syntheticAstFunctionPrefix}nonlocal`,
    arguments: ctx.name_list().map(
      (n) =>
        ({
          nodeType: AstNodeType.expression,
          expressionType: ExpressionNodeType.literal,
          type: "string",
          value: n.getText(),
        }) satisfies LiteralNode,
    ),
  } satisfies FunctionCallNode,
  functionDeclarations: [],
});
