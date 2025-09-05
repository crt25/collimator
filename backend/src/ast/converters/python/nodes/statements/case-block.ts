import { AstNodeType } from "src/ast/types/general-ast";
import {
  FunctionCallNode,
  FunctionDeclarationNode,
  StatementNodeType,
} from "src/ast/types/general-ast/ast-nodes";
import { StatementSequenceNode } from "src/ast/types/general-ast/ast-nodes/statement-node/statement-sequence-node";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { Case_blockContext, GuardContext } from "../../generated/PythonParser";

export const convertCaseBlock = (
  visitor: IPythonAstVisitor,
  ctx: Case_blockContext,
): PythonVisitorReturnValue => {
  const patterns = visitor.getExpression(ctx.patterns());
  const args = [patterns.node];
  const functionDeclarations: FunctionDeclarationNode[] = [];

  const guardContext = ctx.guard() as GuardContext | undefined;
  if (guardContext) {
    const guard = visitor.getExpression(guardContext);
    args.push(guard.node);
    functionDeclarations.push(...guard.functionDeclarations);
  }

  const block = visitor.getStatementSequence([ctx.block()]);

  return {
    node: {
      nodeType: AstNodeType.statement,
      statementType: StatementNodeType.sequence,
      statements: [
        {
          nodeType: AstNodeType.statement,
          statementType: StatementNodeType.functionCall,
          name: "@case",
          arguments: args,
        } satisfies FunctionCallNode,
        block.node,
      ],
    } satisfies StatementSequenceNode,
    functionDeclarations,
  };
};
