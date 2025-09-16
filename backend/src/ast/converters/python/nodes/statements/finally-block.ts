import { AstNodeType } from "src/ast/types/general-ast";
import {
  FunctionCallNode,
  StatementNodeType,
} from "src/ast/types/general-ast/ast-nodes";
import { StatementSequenceNode } from "src/ast/types/general-ast/ast-nodes/statement-node/statement-sequence-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Finally_blockContext } from "../../generated/PythonParser";

export const convertFinallyBlock = (
  visitor: IPythonAstVisitor,
  ctx: Finally_blockContext,
): PythonVisitorReturnValue => {
  const statements = visitor.getStatementSequence([ctx.block()]);

  return {
    node: {
      nodeType: AstNodeType.statement,
      statementType: StatementNodeType.sequence,
      statements: [
        {
          nodeType: AstNodeType.statement,
          statementType: StatementNodeType.functionCall,
          name: "@finally",
          arguments: [],
        } satisfies FunctionCallNode,
        ...statements.node.statements,
      ],
    } satisfies StatementSequenceNode,
    functionDeclarations: statements.functionDeclarations,
  };
};
