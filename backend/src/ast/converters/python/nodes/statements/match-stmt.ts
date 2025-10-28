import { AstNodeType } from "src/ast/types/general-ast";
import {
  FunctionCallNode,
  StatementNodeType,
} from "src/ast/types/general-ast/ast-nodes";
import { StatementSequenceNode } from "src/ast/types/general-ast/ast-nodes/statement-node/statement-sequence-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Match_stmtContext } from "../../generated/PythonParser";
import { syntheticAstFunctionPrefix } from "../../constants";

export const convertMatchStmt = (
  visitor: IPythonAstVisitor,
  ctx: Match_stmtContext,
): PythonVisitorReturnValue => {
  const subject = visitor.getExpression(ctx.subject_expr());
  const cases = visitor.getStatementSequence(ctx.case_block_list());

  return {
    node: {
      nodeType: AstNodeType.statement,
      statementType: StatementNodeType.sequence,
      statements: [
        {
          nodeType: AstNodeType.statement,
          statementType: StatementNodeType.functionCall,
          name: `${syntheticAstFunctionPrefix}match`,
          arguments: [subject.node],
        } satisfies FunctionCallNode,
        cases.node,
      ],
    } satisfies StatementSequenceNode,
    functionDeclarations: [
      ...subject.functionDeclarations,
      ...cases.functionDeclarations,
    ],
  };
};
