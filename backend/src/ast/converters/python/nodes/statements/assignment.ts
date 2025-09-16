import { AstNode, AstNodeType } from "src/ast/types/general-ast";
import { StatementNodeType } from "src/ast/types/general-ast/ast-nodes";
import {
  ExpressionNodeType,
  VariableNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { isVariableNode } from "src/ast/types/general-ast/helpers/node-type-checks";
import { MultiAssignmentNode } from "src/ast/types/general-ast/ast-nodes/statement-node/multi-assignment-node";
import {
  Annotated_rhsContext,
  AssignmentContext,
  AugassignContext,
  NameContext,
  Single_subscript_attribute_targetContext,
  Single_targetContext,
  Star_expressionsContext,
  Yield_exprContext,
} from "../../generated/PythonParser";
import { PythonVisitorReturnValue } from "../../python-ast-visitor-return-value";
import { IPythonAstVisitor } from "../../python-ast-visitor-interface";

const createAssignmentOrDeclarationForName = (
  visitor: IPythonAstVisitor,
  variableName: string,
  type: string,
  annotatedRhs: Annotated_rhsContext | undefined,
): PythonVisitorReturnValue =>
  createAssignmentOrDeclaration(
    visitor,
    {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.variable,
      name: variableName,
    } satisfies VariableNode,
    type,
    annotatedRhs,
  );

const createAssignmentOrDeclaration = (
  visitor: IPythonAstVisitor,
  variable: VariableNode,
  type: string,
  annotatedRhs: Annotated_rhsContext | undefined,
): PythonVisitorReturnValue => {
  if (annotatedRhs) {
    const rhs = visitor.getExpression(annotatedRhs);

    return {
      node: {
        nodeType: AstNodeType.statement,
        statementType: StatementNodeType.assignment,
        variable,
        value: rhs.node,
      } satisfies AstNode,
      functionDeclarations: [],
    };
  } else {
    // without a RHS, the assignment is just a type declaration that we ignore
    return {
      node: {
        nodeType: AstNodeType.statement,
        statementType: StatementNodeType.variableDeclaration,
        name: variable.name,
        value: {
          nodeType: AstNodeType.expression,
          expressionType: ExpressionNodeType.literal,
          type,
          value: "null",
        },
      } satisfies AstNode,
      functionDeclarations: [],
    };
  }
};

export const convertAssignment = (
  visitor: IPythonAstVisitor,
  ctx: AssignmentContext,
): PythonVisitorReturnValue => {
  const name = ctx.name() as NameContext | undefined;
  const annotatedRhs = ctx.annotated_rhs() as Annotated_rhsContext | undefined;

  // Simply read the entire type as text
  const type = ctx.expression()?.getText();

  if (name) {
    // https://github.com/antlr/grammars-v4/blob/master/python/python3_13/PythonParser.g4#L98

    return createAssignmentOrDeclarationForName(
      visitor,
      name.getText(),
      type,
      annotatedRhs,
    );
  }
  const singleTarget = ctx.single_target() as Single_targetContext | undefined;
  const singleSubscriptAttribute = ctx.single_subscript_attribute_target() as
    | Single_subscript_attribute_targetContext
    | undefined;

  const singleLhs = singleTarget || singleSubscriptAttribute;

  if (singleLhs && !ctx.augassign()) {
    // https://github.com/antlr/grammars-v4/blob/master/python/python3_13/PythonParser.g4#L99-L100
    const lhs = visitor.visit(singleLhs);

    if (!isVariableNode(lhs.node)) {
      throw new Error(
        `Expected variable node on the LHS of an assignment, but got: ${JSON.stringify(lhs.node)}`,
      );
    }

    return createAssignmentOrDeclaration(visitor, lhs.node, type, annotatedRhs);
  }

  const yieldExpression = ctx.yield_expr() as Yield_exprContext | undefined;
  const starExpressions = ctx.star_expressions() as
    | Star_expressionsContext
    | undefined;
  const rhsExpression = yieldExpression || starExpressions;

  if (!rhsExpression) {
    throw new Error(
      `Expected RHS expression for assignment, but got: ${JSON.stringify(rhsExpression)}`,
    );
  }

  const rhs = visitor.getExpression(rhsExpression);

  const { nodes: starTargets, functionDeclarations } = visitor.getExpressions(
    ctx.star_targets_list(),
  );

  if (starTargets.length > 0) {
    // https://github.com/antlr/grammars-v4/blob/master/python/python3_13/PythonParser.g4#L101

    const rhsNodes =
      rhs.node.expressionType === ExpressionNodeType.sequence
        ? rhs.node.expressions
        : [rhs.node];

    return {
      node: {
        nodeType: AstNodeType.statement,
        statementType: StatementNodeType.multiAssignment,
        assignmentExpressions: starTargets,
        values: rhsNodes,
      } satisfies MultiAssignmentNode,
      functionDeclarations,
    };
  }

  const augmentedAssignment = ctx.augassign() as AugassignContext | undefined;

  if (singleTarget && augmentedAssignment) {
    // https://github.com/antlr/grammars-v4/blob/master/python/python3_13/PythonParser.g4#L102
    const lhs = visitor.visit(singleTarget);

    if (!isVariableNode(lhs.node)) {
      throw new Error(
        `Expected variable node on the LHS of an augmented assignment, but got: ${JSON.stringify(lhs.node)}`,
      );
    }

    // remove the trailing '=' from the operator
    // see https://github.com/antlr/grammars-v4/blob/master/python/python3_13/PythonParser.g4#L106-L119
    const operator = augmentedAssignment.getText().slice(0, -1);

    return {
      node: {
        nodeType: AstNodeType.statement,
        statementType: StatementNodeType.assignment,
        variable: lhs.node,
        value: {
          nodeType: AstNodeType.expression,
          expressionType: ExpressionNodeType.operator,
          operator,
          operands: [lhs.node, rhs.node],
        },
      } satisfies AstNode,
      functionDeclarations: [],
    };
  }

  throw new Error(`Unsupported assignment context: ${JSON.stringify(ctx)}`);
};
