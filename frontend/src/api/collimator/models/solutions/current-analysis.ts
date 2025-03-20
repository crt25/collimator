import { AstNode, AstNodeBase, AstNodeType, GeneralAst } from "@ast/index";
import { match, P } from "ts-pattern";
import {
  ExpressionNodeType,
  FunctionCallNode as FunctionCallExpressionNode,
  LiteralNode,
  OperatorNode,
  VariableNode,
} from "@ast/ast-nodes/expression-node";
import {
  ActorNode,
  ConditionNode,
  EventListenerNode,
  FunctionCallNode as FunctionCallStatementNode,
  FunctionDeclarationNode,
  LoopNode,
  StatementNodeType,
  VariableAssignmentNode,
  VariableDeclarationNode,
} from "@ast/ast-nodes";
import { StatementSequenceNode } from "@ast/ast-nodes/statement-node/statement-sequence-node";
import { isNonNull } from "@/utilities/is-non-null";
import { AstWalkSignal, walkAst } from "@/data-analyzer/ast-walk";
import { ClassProperties } from "../class-properties";
import { SolutionTest } from "./solution-test";

type FoldFunctions<
  TRoot,
  TActor,
  TEventListener,
  TAssignment,
  TCondition,
  TFunctionCallStatement,
  TFunctionDeclaration,
  TLoop,
  TSequence,
  TVariableDeclaration,
  TFunctionExpression,
  TOperator,
  TLiteral,
  TVariable,
  TStatement =
    | TCondition
    | TFunctionDeclaration
    | TLoop
    | TAssignment
    | TVariableDeclaration
    | TFunctionCallStatement
    | TSequence,
  TExpression = TLiteral | TVariable | TFunctionExpression | TOperator,
> = {
  foldAstRoot: (node: GeneralAst, actors: TActor[]) => TRoot;
  foldActorNode: (
    node: ActorNode,
    listeners: () => TEventListener[],
    functionDeclarations: () => TFunctionDeclaration[],
  ) => TActor;
  foldEventListener: (
    node: EventListenerNode,
    conditionParameter: () => TExpression[],
    action: () => TSequence,
  ) => TEventListener;
  foldAssignment: (
    node: VariableAssignmentNode,
    variable: () => TVariable,
    value: () => TExpression,
  ) => TAssignment;
  foldCondition: (
    node: ConditionNode,
    condition: () => TExpression | null,
    whenTrue: () => TSequence,
    whenFalse: () => TSequence,
  ) => TCondition;
  foldFunctionCallStatement: (
    node: FunctionCallStatementNode,
    args: () => TExpression[],
  ) => TFunctionCallStatement;
  foldFunctionDeclaration: (
    node: FunctionDeclarationNode,
    body: () => TSequence,
  ) => TFunctionDeclaration;
  foldLoop: (
    node: LoopNode,
    condition: () => TExpression | null,
    body: () => TSequence,
  ) => TLoop;
  foldSequence: (
    node: StatementSequenceNode,
    statements: () => TStatement[],
  ) => TSequence;
  foldVariableDeclaration: (
    node: VariableDeclarationNode,
    value: () => TExpression,
  ) => TVariableDeclaration;
  foldFunctionExpression: (
    node: FunctionCallExpressionNode,
    args: () => TExpression[],
  ) => TFunctionExpression;
  foldOperator: (
    node: OperatorNode,
    operands: () => TExpression[],
  ) => TOperator;
  foldLiteral: (node: LiteralNode) => TLiteral;
  foldVariable: (node: VariableNode) => TVariable;
};

type FoldReturnType<
  TNode extends AstNode,
  TRoot,
  TActor,
  TEventListener,
  TAssignment,
  TCondition,
  TFunctionCallStatement,
  TFunctionDeclaration,
  TLoop,
  TSequence,
  TVariableDeclaration,
  TFunctionExpression,
  TOperator,
  TLiteral,
  TVariable,
> = TNode extends GeneralAst
  ? TRoot
  : TNode extends ActorNode
    ? TActor
    : TNode extends EventListenerNode
      ? TEventListener
      : TNode extends VariableAssignmentNode
        ? TAssignment
        : TNode extends ConditionNode
          ? TCondition
          : TNode extends FunctionCallStatementNode
            ? TFunctionCallStatement
            : TNode extends FunctionDeclarationNode
              ? TFunctionDeclaration
              : TNode extends LoopNode
                ? TLoop
                : TNode extends StatementSequenceNode
                  ? TSequence
                  : TNode extends VariableDeclarationNode
                    ? TVariableDeclaration
                    : TNode extends FunctionCallExpressionNode
                      ? TFunctionExpression
                      : TNode extends OperatorNode
                        ? TOperator
                        : TNode extends LiteralNode
                          ? TLiteral
                          : TNode extends VariableNode
                            ? TVariable
                            : never;

export const foldAst = <
  TNode extends AstNode,
  TRoot,
  TActor,
  TEventListener,
  TAssignment,
  TCondition,
  TFunctionCallStatement,
  TFunctionDeclaration,
  TLoop,
  TSequence,
  TVariableDeclaration,
  TFunctionExpression,
  TOperator,
  TLiteral,
  TVariable,
>(
  node: TNode,
  fns: FoldFunctions<
    TRoot,
    TActor,
    TEventListener,
    TAssignment,
    TCondition,
    TFunctionCallStatement,
    TFunctionDeclaration,
    TLoop,
    TSequence,
    TVariableDeclaration,
    TFunctionExpression,
    TOperator,
    TLiteral,
    TVariable
  >,
): FoldReturnType<
  TNode,
  TRoot,
  TActor,
  TEventListener,
  TAssignment,
  TCondition,
  TFunctionCallStatement,
  TFunctionDeclaration,
  TLoop,
  TSequence,
  TVariableDeclaration,
  TFunctionExpression,
  TOperator,
  TLiteral,
  TVariable
> => {
  type RetType<TNode extends AstNode> = FoldReturnType<
    TNode,
    TRoot,
    TActor,
    TEventListener,
    TAssignment,
    TCondition,
    TFunctionCallStatement,
    TFunctionDeclaration,
    TLoop,
    TSequence,
    TVariableDeclaration,
    TFunctionExpression,
    TOperator,
    TLiteral,
    TVariable
  >;

  const recurse = <TNode extends AstNode>(node: TNode): RetType<TNode> =>
    foldAst(node, fns);

  const recurseMultiple = <TNode extends AstNode>(
    nodes: TNode[],
  ): RetType<TNode>[] => nodes.map(recurse);

  const {
    foldActorNode,
    foldAssignment,
    foldAstRoot,
    foldCondition,
    foldEventListener,
    foldFunctionCallStatement,
    foldFunctionDeclaration,
    foldFunctionExpression,
    foldLiteral,
    foldLoop,
    foldOperator,
    foldSequence,
    foldVariable,
    foldVariableDeclaration,
  } = fns;

  // @ts-expect-error Cannot infer the type of the return type correctly
  return match(node as AstNode)
    .with(P.array({ nodeType: AstNodeType.actor }), (nodes: ActorNode[]) =>
      foldAstRoot(nodes, recurseMultiple(nodes)),
    )
    .with({ nodeType: AstNodeType.actor }, (node) =>
      foldActorNode(
        node,
        () => recurseMultiple(node.eventListeners),
        () => recurseMultiple(node.functionDeclarations),
      ),
    )
    .with({ nodeType: AstNodeType.eventListener }, (node) =>
      foldEventListener(
        node,
        () => recurseMultiple(node.condition.parameters),
        () => recurse(node.action),
      ),
    )
    .with({ nodeType: AstNodeType.statement }, (node) =>
      match(node)
        .with({ statementType: StatementNodeType.assignment }, (node) =>
          foldAssignment(
            node,
            () => recurse(node.variable),
            () => recurse(node.value),
          ),
        )
        .with({ statementType: StatementNodeType.condition }, (node) =>
          foldCondition(
            node,
            () => (node.condition ? recurse(node.condition) : null),
            () => recurse(node.whenTrue),
            () => recurse(node.whenFalse),
          ),
        )
        .with({ statementType: StatementNodeType.functionCall }, (node) =>
          foldFunctionCallStatement(node, () =>
            recurseMultiple(node.arguments),
          ),
        )
        .with(
          { statementType: StatementNodeType.functionDeclaration },
          (node) => foldFunctionDeclaration(node, () => recurse(node.body)),
        )
        .with({ statementType: StatementNodeType.loop }, (node) =>
          foldLoop(
            node,
            () => (node.condition ? recurse(node.condition) : null),
            () => recurse(node.body),
          ),
        )
        .with({ statementType: StatementNodeType.sequence }, (node) =>
          foldSequence(node, () => recurseMultiple(node.statements)),
        )
        .with(
          { statementType: StatementNodeType.variableDeclaration },
          (node) => foldVariableDeclaration(node, () => recurse(node.value)),
        )
        .exhaustive(),
    )
    .with({ nodeType: AstNodeType.expression }, (node) =>
      match(node)
        .with({ expressionType: ExpressionNodeType.functionCall }, (node) =>
          foldFunctionExpression(node, () => recurseMultiple(node.arguments)),
        )
        .with({ expressionType: ExpressionNodeType.literal }, (node) =>
          foldLiteral(node),
        )
        .with({ expressionType: ExpressionNodeType.operator }, (node) =>
          foldOperator(node, () => recurseMultiple(node.operands)),
        )
        .with({ expressionType: ExpressionNodeType.variable }, (node) =>
          foldVariable(node),
        )
        .exhaustive(),
    )
    .exhaustive();
};

const emptySequence: StatementSequenceNode = {
  nodeType: AstNodeType.statement,
  statementType: StatementNodeType.sequence,
  statements: [],
};

export abstract class CurrentAnalysis {
  readonly taskId: number;
  readonly solutionHash: string;
  readonly generalAst: GeneralAst;

  readonly tests: SolutionTest[];

  protected constructor({
    taskId,
    solutionHash,
    generalAst,
    tests,
  }: ClassProperties<CurrentAnalysis, "sourceId">) {
    this.taskId = taskId;
    this.solutionHash = solutionHash;
    this.generalAst = generalAst;
    this.tests = tests;
  }

  /**
   * A unique identifier for the analysis source, local to the frontend,
   * which is stable across time (i.e. if a student submits a new solution)
   */
  public abstract get sourceId(): string;

  protected abstract withAst(ast: GeneralAst): CurrentAnalysis;

  static selectComponent(
    analysis: CurrentAnalysis,
    componentId: string,
  ): CurrentAnalysis {
    return analysis.withAst(
      CurrentAnalysis.selectAstComponent(analysis.generalAst, componentId),
    );
  }

  private static selectAstComponent(
    ast: GeneralAst,
    componentId: string,
  ): GeneralAst {
    const shouldIncludeNode = (node: AstNodeBase): boolean =>
      node.componentId === undefined || node.componentId === componentId;

    const nodeIfComponentMatches = <T>(
      node: AstNodeBase,
      computeNode: () => T,
    ): T | null => (shouldIncludeNode(node) ? computeNode() : null);

    return foldAst<
      GeneralAst,
      GeneralAst,
      ActorNode | null,
      EventListenerNode | null,
      VariableAssignmentNode | null,
      ConditionNode | null,
      FunctionCallStatementNode | null,
      FunctionDeclarationNode | null,
      LoopNode | null,
      StatementSequenceNode | null,
      VariableDeclarationNode | null,
      FunctionCallExpressionNode | null,
      OperatorNode | null,
      LiteralNode | null,
      VariableNode | null
    >(ast, {
      foldAstRoot: (_node, actors) => actors.filter(isNonNull),
      foldActorNode: (node, listeners, functionDeclarations) =>
        nodeIfComponentMatches(node, () => ({
          ...node,
          eventListeners: listeners().filter(isNonNull),
          functionDeclarations: functionDeclarations().filter(isNonNull),
        })),
      foldEventListener: (node, conditionParameters, action) =>
        nodeIfComponentMatches(node, () => ({
          ...node,
          condition: {
            ...node.condition,
            parameters: conditionParameters().filter(isNonNull),
          },
          action: action() ?? emptySequence,
        })),
      foldAssignment: (node, variable, value) => {
        if (!shouldIncludeNode(node)) {
          return null;
        }

        const variableNode = variable();
        const valueNode = value();

        return variableNode && valueNode
          ? { ...node, variable: variableNode, value: valueNode }
          : null;
      },
      foldCondition: (node, condition, whenTrue, whenFalse) =>
        nodeIfComponentMatches(node, () => ({
          ...node,
          condition: condition(),
          whenTrue: whenTrue() ?? emptySequence,
          whenFalse: whenFalse() ?? emptySequence,
        })),
      foldFunctionCallStatement: (node, args) =>
        nodeIfComponentMatches(node, () => ({
          ...node,
          arguments: args().filter(isNonNull),
        })),
      foldFunctionDeclaration: (node, body) =>
        nodeIfComponentMatches(node, () => ({
          ...node,
          body: body() ?? emptySequence,
        })),
      foldLoop: (node, condition, body) =>
        nodeIfComponentMatches(node, () => ({
          ...node,
          condition: condition(),
          body: body() ?? emptySequence,
        })),
      foldSequence: (node, statements) =>
        nodeIfComponentMatches(node, () => ({
          ...node,
          statements: statements().filter(isNonNull),
        })),
      foldVariableDeclaration: (node, value) => {
        if (!shouldIncludeNode(node)) {
          return null;
        }

        const valueNode = value();

        return valueNode ? { ...node, value: valueNode } : null;
      },
      foldFunctionExpression: (node, args) =>
        nodeIfComponentMatches(node, () => ({
          ...node,
          arguments: args().filter(isNonNull),
        })),
      foldOperator: (node, operands) =>
        nodeIfComponentMatches(node, () => ({
          ...node,
          operands: operands().filter(isNonNull),
        })),
      foldLiteral: (node) => nodeIfComponentMatches(node, () => ({ ...node })),
      foldVariable: (node) => nodeIfComponentMatches(node, () => ({ ...node })),
    });
  }

  static findComponentIds(analysis: CurrentAnalysis): Set<string> {
    const componentIds = new Set<string>();

    const addComponentId = (node: AstNodeBase): AstWalkSignal => {
      if (node.componentId) {
        componentIds.add(node.componentId);
      }

      return AstWalkSignal.continueWalking;
    };

    for (const actor of analysis.generalAst) {
      addComponentId(actor);

      for (const eventListener of actor.eventListeners) {
        addComponentId(eventListener);
      }
    }

    walkAst(analysis.generalAst, {
      expressionCallback: addComponentId,
      statementCallback: addComponentId,
    });

    return componentIds;
  }
}
