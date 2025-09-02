import { AstNodeType } from "src/ast/types/general-ast";
import {
  FunctionCallNode,
  StatementNodeType,
} from "src/ast/types/general-ast/ast-nodes";
import { StatementSequenceNode } from "src/ast/types/general-ast/ast-nodes/statement-node/statement-sequence-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Try_stmtContext } from "../../generated/PythonParser";

export const convertTryStmt = (
  visitor: IPythonAstVisitor,
  ctx: Try_stmtContext,
): PythonVisitorReturnValue => {
  const statements = visitor.getStatementSequence([ctx.block()]);

  const elseBlock = ctx.else_block()
    ? visitor.getStatementSequence([ctx.else_block()])
    : null;

  const finallyBlock = ctx.finally_block()
    ? visitor.getStatementSequence([ctx.finally_block()])
    : null;

  const elseFinallyStatements = [elseBlock, finallyBlock].filter(
    (b) => b !== null,
  );

  const elseFinallyStatementsNodes = elseFinallyStatements.map((s) => s.node);
  const elseFinallyStatementsFunctionDeclarations =
    elseFinallyStatements.flatMap((s) => s.functionDeclarations);

  const exceptBlocks = visitor.getStatementSequence(ctx.except_block_list());
  if (exceptBlocks.node.statements.length > 0) {
    return {
      node: {
        nodeType: AstNodeType.statement,
        statementType: StatementNodeType.sequence,
        statements: [
          {
            nodeType: AstNodeType.statement,
            statementType: StatementNodeType.functionCall,
            name: "@try",
            arguments: [],
          } satisfies FunctionCallNode,
          statements.node,
          exceptBlocks.node,
          ...elseFinallyStatementsNodes,
        ],
      } satisfies StatementSequenceNode,
      functionDeclarations: [
        ...statements.functionDeclarations,
        ...exceptBlocks.functionDeclarations,
        ...elseFinallyStatementsFunctionDeclarations,
      ],
    };
  }

  const exceptStarBlocks = visitor.getStatementSequence(
    ctx.except_star_block_list(),
  );

  return {
    node: {
      nodeType: AstNodeType.statement,
      statementType: StatementNodeType.sequence,
      statements: [
        {
          nodeType: AstNodeType.statement,
          statementType: StatementNodeType.functionCall,
          name: "@try",
          arguments: [],
        } satisfies FunctionCallNode,
        statements.node,
        exceptStarBlocks.node,
        ...elseFinallyStatementsNodes,
      ],
    } satisfies StatementSequenceNode,
    functionDeclarations: [
      ...statements.functionDeclarations,
      ...exceptStarBlocks.functionDeclarations,
      ...elseFinallyStatementsFunctionDeclarations,
    ],
  };
};
