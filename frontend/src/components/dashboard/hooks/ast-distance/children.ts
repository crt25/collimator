import { match, P } from "ts-pattern";
import { AstNode, AstNodeType } from "@ast/index";
import { StatementNodeType } from "@ast/ast-nodes";
import { ExpressionNodeType } from "@ast/ast-nodes/expression-node";

export const getAstNodeChildren = (node: AstNode): AstNode[] =>
  match(node)
    .returnType<AstNode[]>()
    .with(P.array({ nodeType: AstNodeType.actor }), (nodes) => nodes)
    .with({ nodeType: AstNodeType.actor }, (node) => [
      ...node.eventListeners,
      ...node.functionDeclarations,
    ])
    .with({ nodeType: AstNodeType.eventListener }, (node) => [
      node.action,
      ...node.condition.parameters,
    ])
    .with({ nodeType: AstNodeType.statement }, (node) =>
      match(node)
        .returnType<AstNode[]>()
        .with({ statementType: StatementNodeType.assignment }, (node) => [
          node.variable,
          node.value,
        ])
        .with({ statementType: StatementNodeType.condition }, (node) =>
          node.condition
            ? [node.condition, node.whenTrue, node.whenFalse]
            : [node.whenTrue, node.whenFalse],
        )
        .with(
          { statementType: StatementNodeType.functionCall },
          (node) => node.arguments,
        )
        .with(
          { statementType: StatementNodeType.functionDeclaration },
          (node) => [node.body],
        )
        .with({ statementType: StatementNodeType.loop }, (node) =>
          node.condition ? [node.condition, node.body] : [node.body],
        )
        .with(
          { statementType: StatementNodeType.sequence },
          (node) => node.statements,
        )
        .with(
          { statementType: StatementNodeType.variableDeclaration },
          (node) => [node.value],
        )
        .exhaustive(),
    )
    .with({ nodeType: AstNodeType.expression }, (node) =>
      match(node)
        .returnType<AstNode[]>()
        .with(
          { expressionType: ExpressionNodeType.functionCall },
          (node) => node.arguments,
        )
        .with({ expressionType: ExpressionNodeType.literal }, () => [])
        .with(
          { expressionType: ExpressionNodeType.operator },
          (node) => node.operands,
        )
        .with({ expressionType: ExpressionNodeType.variable }, () => [])
        .exhaustive(),
    )
    .exhaustive();
