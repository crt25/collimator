import { AstNodeType } from "src/ast/types/general-ast";
import {
  ConditionNode,
  StatementNode,
  StatementNodeType,
  StatementSequenceNode,
} from "src/ast/types/general-ast/ast-nodes";
import {
  ExpressionNodeType,
  LiteralNode,
  OperatorNode,
  VariableNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import {
  convertPythonToGeneralAst,
  createTopLevelPythonStatementOutput,
} from "../";
import { greaterThanOperator } from "../operators";

const version = "3.9.1";

const xGreaterThan = (value: string): OperatorNode => ({
  nodeType: AstNodeType.expression,
  expressionType: ExpressionNodeType.operator,
  operator: greaterThanOperator,
  operands: [
    {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.variable,
      name: "x",
    } satisfies VariableNode,
    {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.literal,
      type: "number",
      value,
    } satisfies LiteralNode,
  ],
});

const assignNumberTo = (name: string, value: string): StatementNode => ({
  nodeType: AstNodeType.statement,
  statementType: StatementNodeType.multiAssignment,
  assignmentExpressions: [
    {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.variable,
      name,
    } satisfies VariableNode,
  ],
  values: [
    {
      nodeType: AstNodeType.expression,
      expressionType: ExpressionNodeType.literal,
      type: "number",
      value,
    } satisfies LiteralNode,
  ],
});

const sequenceOf = (statements: StatementNode[]): StatementSequenceNode => ({
  nodeType: AstNodeType.statement,
  statementType: StatementNodeType.sequence,
  statements,
});

describe("Python AST converter", () => {
  describe("conditionals", () => {
    it("can convert an if statement without an else branch", () => {
      const ast = convertPythonToGeneralAst(
        `
if x > 3:
    y = 1
        `,
        version,
      );

      expect(ast).toEqual(
        createTopLevelPythonStatementOutput(
          [
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.condition,
              condition: xGreaterThan("3"),
              whenTrue: sequenceOf([assignNumberTo("y", "1")]),
              whenFalse: sequenceOf([]),
            } satisfies ConditionNode,
          ],
          [],
        ),
      );
    });

    it("can convert an if/elif chain without an else branch", () => {
      const ast = convertPythonToGeneralAst(
        `
if x > 3:
    y = 1
elif x > 2:
    y = 2
        `,
        version,
      );

      expect(ast).toEqual(
        createTopLevelPythonStatementOutput(
          [
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.condition,
              condition: xGreaterThan("3"),
              whenTrue: sequenceOf([assignNumberTo("y", "1")]),
              whenFalse: sequenceOf([
                {
                  nodeType: AstNodeType.statement,
                  statementType: StatementNodeType.condition,
                  condition: xGreaterThan("2"),
                  whenTrue: sequenceOf([assignNumberTo("y", "2")]),
                  whenFalse: sequenceOf([]),
                } satisfies ConditionNode,
              ]),
            } satisfies ConditionNode,
          ],
          [],
        ),
      );
    });
  });
});
