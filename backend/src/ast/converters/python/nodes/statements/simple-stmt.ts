import { BreakNode } from "src/ast/types/general-ast/ast-nodes/statement-node/break-node";
import { AstNodeType } from "src/ast/types/general-ast";
import {
  FunctionCallNode,
  StatementNode,
  StatementNodeType,
} from "src/ast/types/general-ast/ast-nodes";
import { ExpressionAsStatementNode } from "src/ast/types/general-ast/ast-nodes/statement-node/expression-as-statement";
import { ExpressionNodeType } from "src/ast/types/general-ast/ast-nodes/expression-node";
import {
  Simple_stmtContext,
  Star_expressionsContext,
} from "../../generated/PythonParser";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";

export const convertSimpleStmt = (
  visitor: IPythonAstVisitor,
  ctx: Simple_stmtContext,
): PythonVisitorReturnValue => {
  if (ctx.PASS()) {
    return {
      functionDeclarations: [],
    };
  }

  if (ctx.BREAK()) {
    return {
      node: {
        nodeType: AstNodeType.statement,
        statementType: StatementNodeType.break,
      } satisfies BreakNode,
      functionDeclarations: [],
    };
  }

  if (ctx.CONTINUE()) {
    return {
      node: {
        nodeType: AstNodeType.statement,
        statementType: StatementNodeType.continue,
      } satisfies StatementNode,
      functionDeclarations: [],
    };
  }

  const starExpression = ctx.star_expressions() as
    | Star_expressionsContext
    | undefined;

  if (starExpression) {
    const expression = visitor.getExpression(starExpression);

    if (expression.node.expressionType === ExpressionNodeType.functionCall) {
      return {
        node: {
          nodeType: AstNodeType.statement,
          statementType: StatementNodeType.functionCall,
          name: expression.node.name,
          arguments: expression.node.arguments,
        } as FunctionCallNode,
        functionDeclarations: expression.functionDeclarations,
      };
    }

    return {
      node: {
        nodeType: AstNodeType.statement,
        statementType: StatementNodeType.expressionAsStatement,
        expression: expression.node,
      } as ExpressionAsStatementNode,
      functionDeclarations: expression.functionDeclarations,
    };
  }

  return visitor.getStatements([
    ctx.assignment() ??
      ctx.type_alias() ??
      ctx.return_stmt() ??
      ctx.import_stmt() ??
      ctx.raise_stmt() ??
      ctx.del_stmt() ??
      ctx.yield_stmt() ??
      ctx.assert_stmt() ??
      ctx.global_stmt() ??
      ctx.nonlocal_stmt(),
  ]);
};
