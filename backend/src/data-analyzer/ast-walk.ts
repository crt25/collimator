import { GeneralAst, StatementNode } from "src/ast/types/general-ast";
import { StatementNodeType } from "src/ast/types/general-ast/ast-nodes";
import {
  ExpressionNode,
  ExpressionNodeType,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { match } from "ts-pattern";

/**
 * Walks through all statements in the AST and calls the callback for each statement.
 * @param ast The AST to walk
 * @param expressionCallback The callback to call for each expression. If the callback returns false, the walking will stop.
 * @param options Options for the walking
 */
const walkExpression = (
  node: ExpressionNode,
  expressionCallback: (node: ExpressionNode) => boolean,
  options: unknown,
): boolean => {
  if (!expressionCallback(node)) {
    return false;
  }

  return match(node)
    .returnType<boolean>()
    .with({ expressionType: ExpressionNodeType.functionCall }, (node) => {
      for (const argument of node.arguments) {
        if (!walkExpression(argument, expressionCallback, options)) {
          return false;
        }
      }

      return true;
    })
    .with({ expressionType: ExpressionNodeType.operator }, (node) => {
      for (const operand of node.operands) {
        if (!walkExpression(operand, expressionCallback, options)) {
          return false;
        }
      }

      return true;
    })
    .otherwise(() => true);
};

/**
 * Walks through all statements in the AST and calls the callback for each statement.
 * @param ast The AST to walk
 * @param statementCallback The callback to call for each statement. If the callback returns false, the walking will stop.
 * @param options Options for the walking
 */
const walkStatement = (
  node: StatementNode,
  callbacks: {
    statementCallback?: (node: StatementNode) => boolean;
    expressionCallback?: (node: ExpressionNode) => boolean;
  },
  options: {
    walkFunctionDeclarations: boolean;
  },
): boolean => {
  if (callbacks.statementCallback && !callbacks.statementCallback(node)) {
    return false;
  }

  return match(node)
    .returnType<boolean>()
    .with({ statementType: StatementNodeType.condition }, (node) => {
      if (node.condition && callbacks.expressionCallback) {
        if (
          !walkExpression(node.condition, callbacks.expressionCallback, options)
        ) {
          return false;
        }
      }

      if (!walkStatement(node.whenTrue, callbacks, options)) {
        return false;
      }

      return walkStatement(node.whenFalse, callbacks, options);
    })
    .with({ statementType: StatementNodeType.loop }, (node) => {
      if (node.condition && callbacks.expressionCallback) {
        if (
          !walkExpression(node.condition, callbacks.expressionCallback, options)
        ) {
          return false;
        }
      }

      return walkStatement(node.body, callbacks, options);
    })
    .with({ statementType: StatementNodeType.functionDeclaration }, (node) => {
      if (options.walkFunctionDeclarations) {
        return walkStatement(node.body, callbacks, options);
      }

      return true;
    })
    .with({ statementType: StatementNodeType.sequence }, (node) => {
      for (const statement of node.statements) {
        if (!walkStatement(statement, callbacks, options)) {
          return false;
        }
      }

      return true;
    })
    .with({ statementType: StatementNodeType.functionCall }, (node) => {
      if (callbacks.expressionCallback) {
        for (const argument of node.arguments) {
          if (
            !walkExpression(argument, callbacks.expressionCallback, options)
          ) {
            return false;
          }
        }

        return true;
      }

      return true;
    })
    .with({ statementType: StatementNodeType.assignment }, (node) => {
      if (callbacks.expressionCallback) {
        return walkExpression(
          node.value,
          callbacks.expressionCallback,
          options,
        );
      }

      return true;
    })
    .with({ statementType: StatementNodeType.variableDeclaration }, (node) => {
      if (node.value && callbacks.expressionCallback) {
        return walkExpression(
          node.value,
          callbacks.expressionCallback,
          options,
        );
      }

      return true;
    })
    .otherwise(() => true);
};

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
    statementCallback?: (node: StatementNode) => boolean;
    expressionCallback?: (node: ExpressionNode) => boolean;
  } = {},
  options = {
    walkFunctionDeclarations: false,
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
