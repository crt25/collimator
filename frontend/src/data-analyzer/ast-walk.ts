import { isNonNull } from "@/utilities/is-non-null";
import {
  ActorNode,
  EventListenerNode,
  StatementNode,
  StatementNodeType,
} from "@ast/ast-nodes";
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
 * @param node The AST node to walk
 * @param depth The depth of the current AST node
 * @param expressionCallback The callback to call for each expression. If the callback returns false, the walking will stop.
 * @param options Options for the walking
 */
const walkExpression = (
  node: ExpressionNode,
  depth: number,
  expressionCallback: (node: ExpressionNode, depth: number) => AstWalkSignal,
  options: unknown,
): AstWalkSignal => {
  if (expressionCallback(node, depth) === AstWalkSignal.stopWalking) {
    return AstWalkSignal.stopWalking;
  }

  return match(node)
    .returnType<AstWalkSignal>()
    .with({ expressionType: ExpressionNodeType.functionCall }, (node) =>
      performWalksUntilStop(
        node.arguments.map((argument) =>
          lazyWalkExpression(argument, depth + 1, expressionCallback, options),
        ),
      ),
    )
    .with({ expressionType: ExpressionNodeType.operator }, (node) =>
      performWalksUntilStop(
        node.operands.map((operand) =>
          lazyWalkExpression(operand, depth + 1, expressionCallback, options),
        ),
      ),
    )
    .otherwise(() => AstWalkSignal.continueWalking);
};

const lazyWalkExpression = (
  node: undefined | null | Parameters<typeof walkExpression>[0],
  depth: number,
  expressionCallback: undefined | null | Parameters<typeof walkExpression>[2],
  options: Parameters<typeof walkExpression>[3],
): null | (() => AstWalkSignal) =>
  // if either the node or expressionCallback is not defined, return null
  expressionCallback && node
    ? (): AstWalkSignal =>
        walkExpression(node, depth, expressionCallback, options)
    : null;

/**
 * Walks through all statements in the AST and calls the callback for each statement.
 * @param node The AST node to walk
 * @param depth The depth of the current AST node
 * @param statementCallback The callback to call for each statement. If the callback returns false, the walking will stop.
 * @param options Options for the walking
 */
const walkStatement = (
  node: StatementNode,
  depth: number,
  callbacks: {
    statementCallback?: (node: StatementNode, depth: number) => AstWalkSignal;
    expressionCallback?: (node: ExpressionNode, depth: number) => AstWalkSignal;
  },
  options: {
    walkFunctionDeclarations: boolean;
  },
): AstWalkSignal => {
  if (
    callbacks.statementCallback &&
    callbacks.statementCallback(node, depth) === AstWalkSignal.stopWalking
  ) {
    return AstWalkSignal.stopWalking;
  }

  return match(node)
    .returnType<AstWalkSignal>()
    .with({ statementType: StatementNodeType.condition }, (node) =>
      performWalksUntilStop([
        lazyWalkExpression(
          node.condition,
          depth + 1,
          callbacks.expressionCallback,
          options,
        ),
        lazyWalkStatement(node.whenTrue, depth + 1, callbacks, options),
        lazyWalkStatement(node.whenFalse, depth + 1, callbacks, options),
      ]),
    )
    .with({ statementType: StatementNodeType.loop }, (node) =>
      performWalksUntilStop([
        lazyWalkExpression(
          node.condition,
          depth + 1,
          callbacks.expressionCallback,
          options,
        ),
        lazyWalkStatement(node.body, depth + 1, callbacks, options),
      ]),
    )
    .with({ statementType: StatementNodeType.functionDeclaration }, (node) =>
      performWalksUntilStop(
        options.walkFunctionDeclarations
          ? [lazyWalkStatement(node.body, depth + 1, callbacks, options)]
          : [],
      ),
    )

    .with({ statementType: StatementNodeType.sequence }, (node) =>
      performWalksUntilStop(
        node.statements.map((statement) =>
          lazyWalkStatement(statement, depth + 1, callbacks, options),
        ),
      ),
    )
    .with({ statementType: StatementNodeType.functionCall }, (node) =>
      performWalksUntilStop(
        node.arguments.map((argument) =>
          lazyWalkExpression(
            argument,
            depth + 1,
            callbacks.expressionCallback,
            options,
          ),
        ),
      ),
    )
    .with({ statementType: StatementNodeType.assignment }, (node) =>
      performWalksUntilStop([
        lazyWalkExpression(
          node.value,
          depth + 1,
          callbacks.expressionCallback,
          options,
        ),
      ]),
    )
    .with(
      { statementType: StatementNodeType.variableDeclaration },
      ({ value }) =>
        performWalksUntilStop([
          lazyWalkExpression(
            value,
            depth + 1,
            callbacks.expressionCallback,
            options,
          ),
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

const actorDepth = 1;
const eventListenerDepth = actorDepth + 1;

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
    actorCallback?: (node: ActorNode, depth: number) => AstWalkSignal;
    eventListenerCallback?: (
      node: EventListenerNode,
      depth: number,
    ) => AstWalkSignal;
    statementCallback?: (node: StatementNode, depth: number) => AstWalkSignal;
    expressionCallback?: (node: ExpressionNode, depth: number) => AstWalkSignal;
  } = {},
  options = {
    walkFunctionDeclarations: true,
  },
): void => {
  for (const actor of ast) {
    if (callbacks.actorCallback) {
      if (
        callbacks.actorCallback(actor, actorDepth) === AstWalkSignal.stopWalking
      ) {
        return;
      }
    }

    for (const eventListener of actor.eventListeners) {
      if (callbacks.eventListenerCallback) {
        if (
          callbacks.eventListenerCallback(eventListener, actorDepth) ===
          AstWalkSignal.stopWalking
        ) {
          return;
        }
      }

      if (callbacks.expressionCallback) {
        for (const parameter of eventListener.condition.parameters) {
          walkExpression(
            parameter,
            eventListenerDepth + 1,
            callbacks.expressionCallback,
            options,
          );
        }
      }

      walkStatement(
        eventListener.action,
        eventListenerDepth + 1,
        callbacks,
        options,
      );
    }

    for (const functionDeclaration of actor.functionDeclarations) {
      walkStatement(functionDeclaration, actorDepth + 1, callbacks, options);
    }
  }
};
