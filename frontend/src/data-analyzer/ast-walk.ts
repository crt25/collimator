import { isNonNull } from "@/utilities/is-non-null";
import { StatementNode, StatementNodeType } from "@ast/ast-nodes";
import {
  ExpressionNode,
  ExpressionNodeType,
} from "@ast/ast-nodes/expression-node";
import { GeneralAst } from "@ast/index";
import { match } from "ts-pattern";

export enum AstWalkSignal {
  continueWalking,
  stopWalking,
}

/**
 * Sequentially execute the passed (non-null) functions and
 * stop as soon as one of them returns a stop signal.
 */
const performWalksUntilStop = (
  walkFunctions: (null | (() => AstWalkSignal))[],
): AstWalkSignal => {
  for (const fn of walkFunctions.filter(isNonNull)) {
    if (fn() === AstWalkSignal.stopWalking) {
      return AstWalkSignal.stopWalking;
    }
  }

  return AstWalkSignal.continueWalking;
};

/**
 * Walks through all statements in the AST and calls the callback for each statement.
 * @param ast The AST to walk
 * @param expressionCallback The callback to call for each expression. If the callback returns false, the walking will stop.
 * @param options Options for the walking
 */
const walkExpression = (
  node: ExpressionNode,
  expressionCallback: (node: ExpressionNode) => AstWalkSignal,
  options: unknown,
): AstWalkSignal => {
  if (expressionCallback(node) === AstWalkSignal.stopWalking) {
    return AstWalkSignal.stopWalking;
  }

  return match(node)
    .returnType<AstWalkSignal>()
    .with({ expressionType: ExpressionNodeType.functionCall }, (node) =>
      performWalksUntilStop(
        node.arguments.map((argument) =>
          lazyWalkExpression(argument, expressionCallback, options),
        ),
      ),
    )
    .with({ expressionType: ExpressionNodeType.operator }, (node) =>
      performWalksUntilStop(
        node.operands.map((operand) =>
          lazyWalkExpression(operand, expressionCallback, options),
        ),
      ),
    )
    .otherwise(() => AstWalkSignal.continueWalking);
};

const lazyWalkExpression = (
  node: undefined | null | Parameters<typeof walkExpression>[0],
  expressionCallback: undefined | null | Parameters<typeof walkExpression>[1],
  options: Parameters<typeof walkExpression>[2],
): null | (() => AstWalkSignal) =>
  // if either the node or expressionCallback is not defined, return null
  expressionCallback && node
    ? (): AstWalkSignal => walkExpression(node, expressionCallback, options)
    : null;

/**
 * Walks through all statements in the AST and calls the callback for each statement.
 * @param ast The AST to walk
 * @param statementCallback The callback to call for each statement. If the callback returns false, the walking will stop.
 * @param options Options for the walking
 */
const walkStatement = (
  node: StatementNode,
  callbacks: {
    statementCallback?: (node: StatementNode) => AstWalkSignal;
    expressionCallback?: (node: ExpressionNode) => AstWalkSignal;
  },
  options: {
    walkFunctionDeclarations: boolean;
  },
): AstWalkSignal => {
  if (
    callbacks.statementCallback &&
    callbacks.statementCallback(node) === AstWalkSignal.stopWalking
  ) {
    return AstWalkSignal.stopWalking;
  }

  return match(node)
    .returnType<AstWalkSignal>()
    .with({ statementType: StatementNodeType.condition }, (node) =>
      performWalksUntilStop([
        lazyWalkExpression(
          node.condition,
          callbacks.expressionCallback,
          options,
        ),
        lazyWalkStatement(node.whenTrue, callbacks, options),
        lazyWalkStatement(node.whenFalse, callbacks, options),
      ]),
    )
    .with({ statementType: StatementNodeType.loop }, (node) =>
      performWalksUntilStop([
        lazyWalkExpression(
          node.condition,
          callbacks.expressionCallback,
          options,
        ),
        lazyWalkStatement(node.body, callbacks, options),
      ]),
    )
    .with({ statementType: StatementNodeType.functionDeclaration }, (node) =>
      performWalksUntilStop(
        options.walkFunctionDeclarations
          ? [lazyWalkStatement(node.body, callbacks, options)]
          : [],
      ),
    )

    .with({ statementType: StatementNodeType.sequence }, (node) =>
      performWalksUntilStop(
        node.statements.map((statement) =>
          lazyWalkStatement(statement, callbacks, options),
        ),
      ),
    )
    .with({ statementType: StatementNodeType.functionCall }, (node) =>
      performWalksUntilStop(
        node.arguments.map((argument) =>
          lazyWalkExpression(argument, callbacks.expressionCallback, options),
        ),
      ),
    )
    .with({ statementType: StatementNodeType.assignment }, (node) =>
      performWalksUntilStop([
        lazyWalkExpression(node.value, callbacks.expressionCallback, options),
      ]),
    )
    .with(
      { statementType: StatementNodeType.variableDeclaration },
      ({ value }) =>
        performWalksUntilStop([
          lazyWalkExpression(value, callbacks.expressionCallback, options),
        ]),
    )
    .otherwise(() => AstWalkSignal.continueWalking);
};

const lazyWalkStatement =
  (
    ...args: Parameters<typeof walkStatement>
  ): (() => ReturnType<typeof walkStatement>) =>
  () =>
    walkStatement(...args);

/**
 * Walks through all statements in the AST and calls the callback for each statement.
 * @param ast The AST to walk
 * @param statementCallback The callback to call for each statement. If the callback returns false, the walking will stop.
 * @param expressionCallback The callback to call for each expression. If the callback returns false, the walking will stop.
 * @param options Options for the walking
 */
export const walkAst = (
  ast: GeneralAst,
  callbacks: {
    statementCallback?: (node: StatementNode) => AstWalkSignal;
    expressionCallback?: (node: ExpressionNode) => AstWalkSignal;
  } = {},
  options = {
    walkFunctionDeclarations: true,
  },
): void => {
  for (const actor of ast) {
    for (const eventListener of actor.eventListeners) {
      if (callbacks.expressionCallback) {
        for (const parameter of eventListener.condition.parameters) {
          walkExpression(parameter, callbacks.expressionCallback, options);
        }
      }

      walkStatement(eventListener.action, callbacks, options);
    }

    for (const functionDeclaration of actor.functionDeclarations) {
      walkStatement(functionDeclaration, callbacks, options);
    }
  }
};
