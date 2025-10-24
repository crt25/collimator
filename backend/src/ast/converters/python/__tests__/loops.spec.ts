import { AstNodeType } from "src/ast/types/general-ast";
import {
  ConditionNode,
  FunctionCallNode,
  LoopNode,
  StatementNode,
  StatementNodeType,
  VariableAssignmentNode,
} from "src/ast/types/general-ast/ast-nodes";
import {
  ExpressionNodeType,
  LiteralNode,
  OperatorNode,
  VariableNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { StatementSequenceNode } from "src/ast/types/general-ast/ast-nodes/statement-node/statement-sequence-node";
import { BreakNode } from "src/ast/types/general-ast/ast-nodes/statement-node/break-node";
import { ContinueNode } from "src/ast/types/general-ast/ast-nodes/statement-node/continue-node";
import { FunctionCallExpressionNode } from "src/ast/types/general-ast/ast-nodes/expression-node/function-call-node";
import {
  convertPythonToGeneralAst,
  createTopLevelPythonStatementOutput,
} from "../";
import { syntheticAstFunctionPrefix } from "../constants";
import { greaterThanOperator } from "../operators";

const version = "3.9.1";

describe("Python AST converter", () => {
  describe("loops", () => {
    it("can convert while loops", () => {
      const ast = convertPythonToGeneralAst(
        `
x = 0
while True:
    x += 1

    if x > 3:
        print("hi")
    elif x > 2:
        continue;
    else:
        break;
else:
  print("loop exited")
        `,
        version,
      );

      expect(ast).toEqual(
        createTopLevelPythonStatementOutput(
          [
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.multiAssignment,
              assignmentExpressions: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.variable,
                  name: "x",
                } satisfies VariableNode,
              ],
              values: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "number",
                  value: "0",
                } satisfies LiteralNode,
              ],
            } satisfies StatementNode,
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.loop,
              condition: {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "boolean",
                value: "true",
              } satisfies LiteralNode,
              body: {
                nodeType: AstNodeType.statement,
                statementType: StatementNodeType.sequence,
                statements: [
                  {
                    nodeType: AstNodeType.statement,
                    statementType: StatementNodeType.assignment,
                    variable: {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.variable,
                      name: "x",
                    } satisfies VariableNode,
                    value: {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.operator,
                      operator: "+",
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
                          value: "1",
                        } satisfies LiteralNode,
                      ],
                    } satisfies OperatorNode,
                  } satisfies VariableAssignmentNode,
                  {
                    nodeType: AstNodeType.statement,
                    statementType: StatementNodeType.condition,
                    condition: {
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
                          value: "3",
                        } satisfies LiteralNode,
                      ],
                    } satisfies OperatorNode,
                    whenTrue: {
                      nodeType: AstNodeType.statement,
                      statementType: StatementNodeType.sequence,
                      statements: [
                        {
                          nodeType: AstNodeType.statement,
                          statementType: StatementNodeType.functionCall,
                          name: "print",
                          arguments: [
                            {
                              nodeType: AstNodeType.expression,
                              expressionType: ExpressionNodeType.literal,
                              type: "string",
                              value: '"hi"',
                            } satisfies LiteralNode,
                          ],
                        } satisfies FunctionCallNode,
                      ],
                    } satisfies StatementSequenceNode,
                    whenFalse: {
                      nodeType: AstNodeType.statement,
                      statementType: StatementNodeType.sequence,
                      statements: [
                        {
                          nodeType: AstNodeType.statement,
                          statementType: StatementNodeType.condition,
                          condition: {
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
                                value: "2",
                              } satisfies LiteralNode,
                            ],
                          } satisfies OperatorNode,
                          whenTrue: {
                            nodeType: AstNodeType.statement,
                            statementType: StatementNodeType.sequence,
                            statements: [
                              {
                                nodeType: AstNodeType.statement,
                                statementType: StatementNodeType.continue,
                              } satisfies ContinueNode,
                            ],
                          } satisfies StatementSequenceNode,
                          whenFalse: {
                            nodeType: AstNodeType.statement,
                            statementType: StatementNodeType.sequence,
                            statements: [
                              {
                                nodeType: AstNodeType.statement,
                                statementType: StatementNodeType.break,
                              } satisfies BreakNode,
                            ],
                          } satisfies StatementSequenceNode,
                        } satisfies ConditionNode,
                      ],
                    } satisfies StatementSequenceNode,
                  } satisfies ConditionNode,
                ],
              } satisfies StatementSequenceNode,
            } satisfies LoopNode,
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.condition,
              condition: {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.functionCall,
                name: `${syntheticAstFunctionPrefix}last-loop-finished`,
                arguments: [],
              } satisfies FunctionCallExpressionNode,
              whenTrue: {
                nodeType: AstNodeType.statement,
                statementType: StatementNodeType.sequence,
                statements: [
                  {
                    nodeType: AstNodeType.statement,
                    statementType: StatementNodeType.functionCall,
                    name: "print",
                    arguments: [
                      {
                        nodeType: AstNodeType.expression,
                        expressionType: ExpressionNodeType.literal,
                        type: "string",
                        value: '"loop exited"',
                      } satisfies LiteralNode,
                    ],
                  } satisfies FunctionCallNode,
                ],
              } satisfies StatementSequenceNode,
              whenFalse: {
                nodeType: AstNodeType.statement,
                statementType: StatementNodeType.sequence,
                statements: [],
              } satisfies StatementSequenceNode,
            } satisfies ConditionNode,
          ],
          [],
        ),
      );
    });

    it("can convert for loops", () => {
      const ast = convertPythonToGeneralAst(
        `
for i in range(5):
    break
else:
    pass
        `,
        version,
      );

      expect(ast).toEqual(
        createTopLevelPythonStatementOutput(
          [
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.loop,
              condition: {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.operator,
                operator: "for",
                operands: [
                  {
                    nodeType: AstNodeType.expression,
                    expressionType: ExpressionNodeType.variable,
                    name: "i",
                  } satisfies VariableNode,
                  {
                    nodeType: AstNodeType.expression,
                    expressionType: ExpressionNodeType.functionCall,
                    name: "range",
                    arguments: [
                      {
                        nodeType: AstNodeType.expression,
                        expressionType: ExpressionNodeType.literal,
                        type: "number",
                        value: "5",
                      } satisfies LiteralNode,
                    ],
                  } satisfies FunctionCallExpressionNode,
                ],
              } satisfies OperatorNode,
              body: {
                nodeType: AstNodeType.statement,
                statementType: StatementNodeType.sequence,
                statements: [
                  {
                    nodeType: AstNodeType.statement,
                    statementType: StatementNodeType.break,
                  } satisfies BreakNode,
                ],
              } satisfies StatementSequenceNode,
            } satisfies LoopNode,
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.condition,
              condition: {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.functionCall,
                name: `${syntheticAstFunctionPrefix}last-loop-finished`,
                arguments: [],
              } satisfies FunctionCallExpressionNode,
              whenFalse: {
                nodeType: AstNodeType.statement,
                statementType: StatementNodeType.sequence,
                statements: [],
              } satisfies StatementSequenceNode,
              whenTrue: {
                nodeType: AstNodeType.statement,
                statementType: StatementNodeType.sequence,
                statements: [],
              } satisfies StatementSequenceNode,
            } satisfies ConditionNode,
          ],
          [],
        ),
      );
    });
  });
});
