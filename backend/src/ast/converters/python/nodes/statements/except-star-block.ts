import {
  ExpressionNode,
  ExpressionNodeType,
  LiteralNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import {
  FunctionCallNode,
  FunctionDeclarationNode,
  StatementNodeType,
} from "src/ast/types/general-ast/ast-nodes";
import { AstNodeType } from "src/ast/types/general-ast";
import { StatementSequenceNode } from "src/ast/types/general-ast/ast-nodes/statement-node/statement-sequence-node";
import {
  Except_star_blockContext,
  ExpressionContext,
} from "../../generated/PythonParser";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";
import { syntheticAstFunctionPrefix } from "../../constants";

export const convertExceptStarBlock = (
  visitor: IPythonAstVisitor,
  ctx: Except_star_blockContext,
): PythonVisitorReturnValue => {
  const args: ExpressionNode[] = [];
  const functionDeclarations: FunctionDeclarationNode[] = [];

  const expressionContext = ctx.expression() as ExpressionContext | undefined;
  if (expressionContext) {
    const expression = visitor.getExpression(expressionContext);
    args.push(expression.node);
    functionDeclarations.push(...expression.functionDeclarations);

    if (ctx.name()) {
      args.push({
        nodeType: AstNodeType.expression,
        expressionType: ExpressionNodeType.literal,
        type: "string",
        value: ctx.name().getText(),
      } satisfies LiteralNode);
    }
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
          name: `${syntheticAstFunctionPrefix}except-star`,
          arguments: args,
        } satisfies FunctionCallNode,
        block.node,
      ],
    } satisfies StatementSequenceNode,
    functionDeclarations: [
      ...functionDeclarations,
      ...block.functionDeclarations,
    ],
  };
};
