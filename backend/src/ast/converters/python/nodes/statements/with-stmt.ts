import { StatementSequenceNode } from "src/ast/types/general-ast/ast-nodes/statement-node/statement-sequence-node";
import { AstNodeType } from "src/ast/types/general-ast";
import {
  FunctionCallNode,
  StatementNodeType,
} from "src/ast/types/general-ast/ast-nodes";
import {
  ExpressionNodeType,
  LiteralNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { With_stmtContext } from "../../generated/PythonParser";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";

export const convertWithStmt = (
  visitor: IPythonAstVisitor,
  ctx: With_stmtContext,
): PythonVisitorReturnValue => {
  const isAsync = ctx.ASYNC() ? true : false;
  const withExpressions = visitor.getExpressions(ctx.with_item_list());
  const statements = visitor.getStatementSequence([ctx.block()]);

  return {
    node: {
      nodeType: AstNodeType.statement,
      statementType: StatementNodeType.sequence,
      statements: [
        {
          nodeType: AstNodeType.statement,
          statementType: StatementNodeType.functionCall,
          name: "@with",
          arguments: [
            {
              nodeType: AstNodeType.expression,
              expressionType: ExpressionNodeType.literal,
              type: "boolean",
              value: isAsync ? "true" : "false",
            } satisfies LiteralNode,
            ...withExpressions.nodes,
          ],
        } satisfies FunctionCallNode,
        ...statements.node.statements,
      ],
    } satisfies StatementSequenceNode,
    functionDeclarations: [
      ...withExpressions.functionDeclarations,
      ...statements.functionDeclarations,
    ],
  };
};
