import { match, P } from "ts-pattern";
import { AstNode, AstNodeType } from "@ast/index";
import { StatementNodeType } from "@ast/ast-nodes";
import { ExpressionNodeType } from "@ast/ast-nodes/expression-node";

const separator = "#";

const getName = (...args: string[]): string => args.join(separator);

export const getAstNodeLabel = (node: AstNode): string =>
  match(node)
    .returnType<string>()
    .with(P.array({ nodeType: AstNodeType.actor }), () => "root")
    .with({ nodeType: AstNodeType.actor }, (node) => node.nodeType)
    .with({ nodeType: AstNodeType.eventListener }, (node) =>
      getName(node.nodeType, node.condition.event),
    )
    .with({ nodeType: AstNodeType.statement }, (node) =>
      match(node)
        .returnType<string>()
        .with({ statementType: StatementNodeType.assignment }, (node) =>
          getName(node.nodeType, node.statementType),
        )
        .with({ statementType: StatementNodeType.condition }, (node) =>
          getName(node.nodeType, node.statementType),
        )
        .with({ statementType: StatementNodeType.functionCall }, (node) =>
          getName(node.nodeType, node.statementType, node.name),
        )
        .with(
          { statementType: StatementNodeType.functionDeclaration },
          (node) =>
            getName(
              node.nodeType,
              node.statementType,
              node.name,
              node.parameterNames.length.toString(),
            ),
        )
        .with({ statementType: StatementNodeType.loop }, (node) =>
          getName(node.nodeType, node.statementType),
        )
        .with({ statementType: StatementNodeType.sequence }, (node) =>
          getName(node.nodeType, node.statementType),
        )
        .with(
          { statementType: StatementNodeType.variableDeclaration },
          (node) =>
            getName(
              node.nodeType,
              node.statementType,
              node.name,
              node.type ?? "",
            ),
        )
        .exhaustive(),
    )
    .with({ nodeType: AstNodeType.expression }, (node) =>
      match(node)
        .returnType<string>()
        .with({ expressionType: ExpressionNodeType.functionCall }, (node) =>
          getName(node.nodeType, node.expressionType, node.name),
        )
        .with({ expressionType: ExpressionNodeType.literal }, (node) =>
          getName(node.nodeType, node.expressionType, node.type, node.value),
        )
        .with({ expressionType: ExpressionNodeType.operator }, (node) =>
          getName(node.nodeType, node.expressionType, node.operator),
        )
        .with({ expressionType: ExpressionNodeType.variable }, (node) =>
          getName(node.nodeType, node.expressionType, node.name),
        )
        .exhaustive(),
    )
    .exhaustive();
