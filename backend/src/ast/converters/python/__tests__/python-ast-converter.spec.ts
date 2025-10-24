import { AstNodeType } from "src/ast/types/general-ast";
import {
  ConditionNode,
  FunctionCallNode,
  FunctionDeclarationNode,
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
import { ExpressionSequenceNode } from "src/ast/types/general-ast/ast-nodes/expression-node/expression-sequence-node";
import { StatementSequenceNode } from "src/ast/types/general-ast/ast-nodes/statement-node/statement-sequence-node";
import { BreakNode } from "src/ast/types/general-ast/ast-nodes/statement-node/break-node";
import { ContinueNode } from "src/ast/types/general-ast/ast-nodes/statement-node/continue-node";
import { FunctionCallExpressionNode } from "src/ast/types/general-ast/ast-nodes/expression-node/function-call-node";
import { LambdaNode } from "src/ast/types/general-ast/ast-nodes/expression-node/lambda-node";
import { ReturnNode } from "src/ast/types/general-ast/ast-nodes/statement-node/return-node";
import { ClassDeclarationNode } from "src/ast/types/general-ast/ast-nodes/statement-node/class-declaration-node";
import {
  convertPythonToGeneralAst,
  createTopLevelPythonStatementOutput,
} from "../";
import { syntheticAstFunctionPrefix } from "../constants";
import {
  createKeyValuePairOperator,
  dictionaryComprehensionOperator,
  equalityOperator,
  fieldAccessOperator,
  fStringConversionOperator,
  fStringFormatSpecOperator,
  fStringOperator,
  fStringReplacementFieldOperator,
  greaterThanOperator,
  lessThanOperator,
  listComprehensionOperator,
} from "../operators";

describe("Python AST converter", () => {
  describe("declarations and assignments", () => {
    it("can convert variable declarations", () => {
      const ast = convertPythonToGeneralAst(
        `
x: int
        `,
      );

      expect(ast).toEqual(
        createTopLevelPythonStatementOutput(
          [
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.variableDeclaration,
              name: "x",
              value: {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.literal,
                type: "int",
                value: "null",
              } as LiteralNode,
            } satisfies StatementNode,
          ],
          [],
        ),
      );
    });

    it("can convert simple variable assignments", () => {
      const ast = convertPythonToGeneralAst(
        `
x = 1
        `,
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
                  value: "1",
                } satisfies LiteralNode,
              ],
            } satisfies StatementNode,
          ],
          [],
        ),
      );
    });

    it("can convert multi-variable assignments", () => {
      const ast = convertPythonToGeneralAst(
        `
x, y, z = 1, "hallo", 3.14
        `,
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
                  expressionType: ExpressionNodeType.sequence,
                  expressions: [
                    {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.variable,
                      name: "x",
                    } satisfies VariableNode,
                    {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.variable,
                      name: "y",
                    } satisfies VariableNode,
                    {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.variable,
                      name: "z",
                    } satisfies VariableNode,
                  ],
                } satisfies ExpressionSequenceNode,
              ],
              values: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "number",
                  value: "1",
                } satisfies LiteralNode,
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "string",
                  value: '"hallo"',
                } satisfies LiteralNode,
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "number",
                  value: "3.14",
                } satisfies LiteralNode,
              ],
            } satisfies StatementNode,
          ],
          [],
        ),
      );
    });

    it("can convert complex string expressions", () => {
      const ast = convertPythonToGeneralAst(
        `
language = "python"
version = 3
weird_string_syntax = "somehow"f"this""is""allowed"f"in {python} {version=!a:.2f}"
        `,
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
                  name: "language",
                } satisfies VariableNode,
              ],
              values: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "string",
                  value: '"python"',
                } satisfies LiteralNode,
              ],
            } satisfies StatementNode,
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.multiAssignment,
              assignmentExpressions: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.variable,
                  name: "version",
                } satisfies VariableNode,
              ],
              values: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "number",
                  value: "3",
                } satisfies LiteralNode,
              ],
            } satisfies StatementNode,
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.multiAssignment,
              assignmentExpressions: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.variable,
                  name: "weird_string_syntax",
                } satisfies VariableNode,
              ],
              values: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.operator,
                  operator: "concat",
                  operands: [
                    {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.literal,
                      type: "string",
                      value: '"somehow"',
                    } satisfies LiteralNode,
                    {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.operator,
                      operator: fStringOperator,
                      operands: [
                        // beginning of fstring
                        {
                          nodeType: AstNodeType.expression,
                          expressionType: ExpressionNodeType.literal,
                          type: "string",
                          value: 'f"',
                        } satisfies LiteralNode,
                        // end of fstring
                        {
                          nodeType: AstNodeType.expression,
                          expressionType: ExpressionNodeType.literal,
                          type: "string",
                          value: '"',
                        } satisfies LiteralNode,
                        {
                          nodeType: AstNodeType.expression,
                          expressionType: ExpressionNodeType.literal,
                          type: "string",
                          value: "this",
                        } satisfies LiteralNode,
                      ],
                    } satisfies OperatorNode,
                    {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.literal,
                      type: "string",
                      value: '"is"',
                    } satisfies LiteralNode,
                    {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.literal,
                      type: "string",
                      value: '"allowed"',
                    } satisfies LiteralNode,
                    {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.operator,
                      operator: fStringOperator,
                      operands: [
                        // start of fstring
                        {
                          nodeType: AstNodeType.expression,
                          expressionType: ExpressionNodeType.literal,
                          type: "string",
                          value: 'f\"',
                        } satisfies LiteralNode,
                        // end of fstring
                        {
                          nodeType: AstNodeType.expression,
                          expressionType: ExpressionNodeType.literal,
                          type: "string",
                          value: '\"',
                        } satisfies LiteralNode,
                        {
                          nodeType: AstNodeType.expression,
                          expressionType: ExpressionNodeType.literal,
                          type: "string",
                          value: "in ",
                        } satisfies LiteralNode,
                        {
                          nodeType: AstNodeType.expression,
                          expressionType: ExpressionNodeType.operator,
                          operator: fStringReplacementFieldOperator,
                          operands: [
                            {
                              nodeType: AstNodeType.expression,
                              expressionType: ExpressionNodeType.variable,
                              name: "python",
                            } satisfies VariableNode,
                          ],
                        } satisfies OperatorNode,
                        {
                          nodeType: AstNodeType.expression,
                          expressionType: ExpressionNodeType.literal,
                          type: "string",
                          value: " ",
                        } satisfies LiteralNode,
                        {
                          nodeType: AstNodeType.expression,
                          expressionType: ExpressionNodeType.operator,
                          operator: fStringReplacementFieldOperator,
                          operands: [
                            {
                              nodeType: AstNodeType.expression,
                              expressionType: ExpressionNodeType.variable,
                              name: "version",
                            } satisfies VariableNode,
                            {
                              nodeType: AstNodeType.expression,
                              expressionType: ExpressionNodeType.literal,
                              type: "string",
                              value: "=",
                            } satisfies LiteralNode,
                            {
                              nodeType: AstNodeType.expression,
                              expressionType: ExpressionNodeType.operator,
                              operator: fStringConversionOperator,
                              operands: [
                                {
                                  nodeType: AstNodeType.expression,
                                  expressionType: ExpressionNodeType.literal,
                                  type: "string",
                                  value: "a",
                                } satisfies LiteralNode,
                              ],
                            } satisfies OperatorNode,
                            {
                              nodeType: AstNodeType.expression,
                              expressionType: ExpressionNodeType.operator,
                              operator: fStringFormatSpecOperator,
                              operands: [
                                {
                                  nodeType: AstNodeType.expression,
                                  expressionType: ExpressionNodeType.literal,
                                  type: "string",
                                  value: ".2f",
                                } satisfies LiteralNode,
                              ],
                            } satisfies OperatorNode,
                          ],
                        } satisfies OperatorNode,
                      ],
                    } satisfies OperatorNode,
                  ],
                } satisfies OperatorNode,
              ],
            } satisfies StatementNode,
          ],
          [],
        ),
      );
    });
  });

  describe("function definitions", () => {
    it("can convert a simple function declaration", () => {
      const ast = convertPythonToGeneralAst(
        `
def my_function(x, y):
    return x + y
        `,
      );

      expect(ast).toEqual(
        createTopLevelPythonStatementOutput(
          [
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionDeclaration,
              name: "my_function",
              parameterNames: ["x", "y"],
              body: {
                nodeType: AstNodeType.statement,
                statementType: StatementNodeType.sequence,
                statements: [
                  {
                    nodeType: AstNodeType.statement,
                    statementType: StatementNodeType.return,
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
                          expressionType: ExpressionNodeType.variable,
                          name: "y",
                        } satisfies VariableNode,
                      ],
                    } satisfies OperatorNode,
                  },
                ],
              },
            } satisfies FunctionDeclarationNode,
          ],
          [],
        ),
      );
    });

    it("can convert a simple function declaration with type annotations", () => {
      const ast = convertPythonToGeneralAst(
        `
def my_function(x: int, y: float) -> float:
    return x + y
        `,
      );

      expect(ast).toEqual(
        createTopLevelPythonStatementOutput(
          [
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionDeclaration,
              name: "my_function",
              parameterNames: ["x", "y"],
              body: {
                nodeType: AstNodeType.statement,
                statementType: StatementNodeType.sequence,
                statements: [
                  {
                    nodeType: AstNodeType.statement,
                    statementType: StatementNodeType.return,
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
                          expressionType: ExpressionNodeType.variable,
                          name: "y",
                        } satisfies VariableNode,
                      ],
                    } satisfies OperatorNode,
                  },
                ],
              },
            } satisfies FunctionDeclarationNode,
          ],
          [],
        ),
      );
    });

    it("can convert a typed generic function declaration", () => {
      const ast = convertPythonToGeneralAst(
        `
def first[T](seq: Sequence[T]) -> T:
    return seq[0]
        `,
      );

      expect(ast).toEqual(
        createTopLevelPythonStatementOutput(
          [
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionDeclaration,
              name: "first",
              parameterNames: ["seq"],
              body: {
                nodeType: AstNodeType.statement,
                statementType: StatementNodeType.sequence,
                statements: [
                  {
                    nodeType: AstNodeType.statement,
                    statementType: StatementNodeType.return,
                    value: {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.operator,
                      operator: "slice",
                      operands: [
                        {
                          nodeType: AstNodeType.expression,
                          expressionType: ExpressionNodeType.variable,
                          name: "seq",
                        } satisfies VariableNode,
                        {
                          nodeType: AstNodeType.expression,
                          expressionType: ExpressionNodeType.sequence,
                          expressions: [
                            {
                              nodeType: AstNodeType.expression,
                              expressionType: ExpressionNodeType.literal,
                              type: "number",
                              value: "0",
                            } satisfies LiteralNode,
                          ],
                        } satisfies ExpressionSequenceNode,
                      ],
                    } satisfies OperatorNode,
                  },
                ],
              },
            } satisfies FunctionDeclarationNode,
          ],
          [],
        ),
      );
    });
  });

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

  describe("lambda expressions", () => {
    it("can convert lambda expressions", () => {
      const ast = convertPythonToGeneralAst(
        `
filter(lambda num: num % 2 == 0, range(100))
        `,
      );

      expect(ast).toEqual(
        createTopLevelPythonStatementOutput(
          [
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: "filter",
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.lambda,
                  parameterNames: ["num"],
                  body: {
                    nodeType: AstNodeType.statement,
                    statementType: StatementNodeType.sequence,
                    statements: [
                      {
                        nodeType: AstNodeType.statement,
                        statementType: StatementNodeType.return,
                        value: {
                          nodeType: AstNodeType.expression,
                          expressionType: ExpressionNodeType.operator,
                          operator: equalityOperator,
                          operands: [
                            {
                              nodeType: AstNodeType.expression,
                              expressionType: ExpressionNodeType.operator,
                              operator: "%",
                              operands: [
                                {
                                  nodeType: AstNodeType.expression,
                                  expressionType: ExpressionNodeType.variable,
                                  name: "num",
                                } satisfies VariableNode,
                                {
                                  nodeType: AstNodeType.expression,
                                  expressionType: ExpressionNodeType.literal,
                                  type: "number",
                                  value: "2",
                                } satisfies LiteralNode,
                              ],
                            } satisfies OperatorNode,
                            {
                              nodeType: AstNodeType.expression,
                              expressionType: ExpressionNodeType.literal,
                              type: "number",
                              value: "0",
                            } satisfies LiteralNode,
                          ],
                        } satisfies OperatorNode,
                      } satisfies ReturnNode,
                    ],
                  } satisfies StatementSequenceNode,
                } satisfies LambdaNode,
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.functionCall,
                  name: "range",
                  arguments: [
                    {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.literal,
                      type: "number",
                      value: "100",
                    } satisfies LiteralNode,
                  ],
                } satisfies FunctionCallExpressionNode,
              ],
            } satisfies FunctionCallNode,
          ],
          [],
        ),
      );
    });
  });

  describe("comprehension expressions", () => {
    it("can convert list comprehensions", () => {
      const ast = convertPythonToGeneralAst(
        `
      [i*2 for i in range(10)]
        `,
      );

      expect(ast).toEqual(
        createTopLevelPythonStatementOutput(
          [
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.expressionAsStatement,
              expression: {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.operator,
                operator: listComprehensionOperator,
                operands: [
                  {
                    nodeType: AstNodeType.expression,
                    expressionType: ExpressionNodeType.operator,
                    operator: "*",
                    operands: [
                      {
                        nodeType: AstNodeType.expression,
                        expressionType: ExpressionNodeType.variable,
                        name: "i",
                      } satisfies VariableNode,
                      {
                        nodeType: AstNodeType.expression,
                        expressionType: ExpressionNodeType.literal,
                        type: "number",
                        value: "2",
                      } satisfies LiteralNode,
                    ],
                  } satisfies OperatorNode,
                  {
                    nodeType: AstNodeType.expression,
                    expressionType: ExpressionNodeType.sequence,
                    expressions: [
                      {
                        nodeType: AstNodeType.expression,
                        expressionType: ExpressionNodeType.operator,
                        operator: "for-if-clause",
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
                                value: "10",
                              } satisfies LiteralNode,
                            ],
                          } satisfies FunctionCallExpressionNode,
                        ],
                      } satisfies OperatorNode,
                    ],
                  } satisfies ExpressionSequenceNode,
                ],
              } satisfies OperatorNode,
            },
          ],
          [],
        ),
      );
    });

    it("can convert set comprehensions", () => {
      const ast = convertPythonToGeneralAst(
        `
      {i*2 for i in range(10)}
        `,
      );

      expect(ast).toEqual(
        createTopLevelPythonStatementOutput(
          [
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.expressionAsStatement,
              expression: {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.operator,
                operator: "set-comprehension",
                operands: [
                  {
                    nodeType: AstNodeType.expression,
                    expressionType: ExpressionNodeType.operator,
                    operator: "*",
                    operands: [
                      {
                        nodeType: AstNodeType.expression,
                        expressionType: ExpressionNodeType.variable,
                        name: "i",
                      } satisfies VariableNode,
                      {
                        nodeType: AstNodeType.expression,
                        expressionType: ExpressionNodeType.literal,
                        type: "number",
                        value: "2",
                      } satisfies LiteralNode,
                    ],
                  } satisfies OperatorNode,
                  {
                    nodeType: AstNodeType.expression,
                    expressionType: ExpressionNodeType.sequence,
                    expressions: [
                      {
                        nodeType: AstNodeType.expression,
                        expressionType: ExpressionNodeType.operator,
                        operator: "for-if-clause",
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
                                value: "10",
                              } satisfies LiteralNode,
                            ],
                          } satisfies FunctionCallExpressionNode,
                        ],
                      } satisfies OperatorNode,
                    ],
                  } satisfies ExpressionSequenceNode,
                ],
              } satisfies OperatorNode,
            },
          ],
          [],
        ),
      );
    });

    it("can convert generator expression", () => {
      const ast = convertPythonToGeneralAst(
        `
      (i*2 for i in range(10))
        `,
      );

      expect(ast).toEqual(
        createTopLevelPythonStatementOutput(
          [
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.expressionAsStatement,
              expression: {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.operator,
                operator: "generator-expression",
                operands: [
                  {
                    nodeType: AstNodeType.expression,
                    expressionType: ExpressionNodeType.operator,
                    operator: "*",
                    operands: [
                      {
                        nodeType: AstNodeType.expression,
                        expressionType: ExpressionNodeType.variable,
                        name: "i",
                      } satisfies VariableNode,
                      {
                        nodeType: AstNodeType.expression,
                        expressionType: ExpressionNodeType.literal,
                        type: "number",
                        value: "2",
                      } satisfies LiteralNode,
                    ],
                  } satisfies OperatorNode,
                  {
                    nodeType: AstNodeType.expression,
                    expressionType: ExpressionNodeType.sequence,
                    expressions: [
                      {
                        nodeType: AstNodeType.expression,
                        expressionType: ExpressionNodeType.operator,
                        operator: "for-if-clause",
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
                                value: "10",
                              } satisfies LiteralNode,
                            ],
                          } satisfies FunctionCallExpressionNode,
                        ],
                      } satisfies OperatorNode,
                    ],
                  } satisfies ExpressionSequenceNode,
                ],
              } satisfies OperatorNode,
            },
          ],
          [],
        ),
      );
    });

    it("can convert dictionary comprehension", () => {
      const ast = convertPythonToGeneralAst(
        `
      {k:v for (k,v) in my_func() if k < 3}
        `,
      );

      expect(ast).toEqual(
        createTopLevelPythonStatementOutput(
          [
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.expressionAsStatement,
              expression: {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.operator,
                operator: dictionaryComprehensionOperator,
                operands: [
                  {
                    nodeType: AstNodeType.expression,
                    expressionType: ExpressionNodeType.operator,
                    operator: createKeyValuePairOperator,
                    operands: [
                      {
                        nodeType: AstNodeType.expression,
                        expressionType: ExpressionNodeType.variable,
                        name: "k",
                      } satisfies VariableNode,
                      {
                        nodeType: AstNodeType.expression,
                        expressionType: ExpressionNodeType.variable,
                        name: "v",
                      } satisfies VariableNode,
                    ],
                  } satisfies OperatorNode,
                  {
                    nodeType: AstNodeType.expression,
                    expressionType: ExpressionNodeType.sequence,
                    expressions: [
                      {
                        nodeType: AstNodeType.expression,
                        expressionType: ExpressionNodeType.operator,
                        operator: "for-if-clause",
                        operands: [
                          {
                            nodeType: AstNodeType.expression,
                            expressionType: ExpressionNodeType.operator,
                            operator: "create-tuple",
                            operands: [
                              {
                                nodeType: AstNodeType.expression,
                                expressionType: ExpressionNodeType.variable,
                                name: "k",
                              } satisfies VariableNode,
                              {
                                nodeType: AstNodeType.expression,
                                expressionType: ExpressionNodeType.variable,
                                name: "v",
                              } satisfies VariableNode,
                            ],
                          } satisfies OperatorNode,
                          {
                            nodeType: AstNodeType.expression,
                            expressionType: ExpressionNodeType.functionCall,
                            name: "my_func",
                            arguments: [],
                          } satisfies FunctionCallExpressionNode,
                          {
                            nodeType: AstNodeType.expression,
                            expressionType: ExpressionNodeType.operator,
                            operator: lessThanOperator,
                            operands: [
                              {
                                nodeType: AstNodeType.expression,
                                expressionType: ExpressionNodeType.variable,
                                name: "k",
                              } satisfies VariableNode,
                              {
                                nodeType: AstNodeType.expression,
                                expressionType: ExpressionNodeType.literal,
                                type: "number",
                                value: "3",
                              } satisfies LiteralNode,
                            ],
                          } satisfies OperatorNode,
                        ],
                      } satisfies OperatorNode,
                    ],
                  } satisfies ExpressionSequenceNode,
                ],
              } satisfies OperatorNode,
            },
          ],
          [],
        ),
      );
    });
  });

  describe("imports", () => {
    it("can convert simple imports", () => {
      const ast = convertPythonToGeneralAst(
        `
import numpy
        `,
      );

      expect(ast).toEqual(
        createTopLevelPythonStatementOutput(
          [
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: `${syntheticAstFunctionPrefix}import`,
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "string",
                  value: "numpy",
                } as LiteralNode,
              ],
            } satisfies StatementNode,
          ],
          [],
        ),
      );
    });

    it("can convert aliased imports", () => {
      const ast = convertPythonToGeneralAst(
        `
import numpy as np
        `,
      );

      expect(ast).toEqual(
        createTopLevelPythonStatementOutput(
          [
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: `${syntheticAstFunctionPrefix}import`,
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.operator,
                  operator: "as",
                  operands: [
                    {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.literal,
                      type: "string",
                      value: "numpy",
                    } as LiteralNode,
                    {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.literal,
                      type: "string",
                      value: "np",
                    } as LiteralNode,
                  ],
                } as OperatorNode,
              ],
            } satisfies StatementNode,
          ],
          [],
        ),
      );
    });

    it("can convert submodules", () => {
      const ast = convertPythonToGeneralAst(
        `
import my_module.submodule as m
        `,
      );

      expect(ast).toEqual(
        createTopLevelPythonStatementOutput(
          [
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: `${syntheticAstFunctionPrefix}import`,
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.operator,
                  operator: "as",
                  operands: [
                    {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.literal,
                      type: "string",
                      value: "my_module.submodule",
                    } as LiteralNode,
                    {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.literal,
                      type: "string",
                      value: "m",
                    } as LiteralNode,
                  ],
                } as OperatorNode,
              ],
            } satisfies StatementNode,
          ],
          [],
        ),
      );
    });

    it("can convert relative imports", () => {
      const ast = convertPythonToGeneralAst(
        `
from .... import my_module as m
        `,
      );

      expect(ast).toEqual(
        createTopLevelPythonStatementOutput(
          [
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: `${syntheticAstFunctionPrefix}import`,
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.operator,
                  operator: "as",
                  operands: [
                    {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.literal,
                      type: "string",
                      value: "....my_module",
                    } as LiteralNode,
                    {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.literal,
                      type: "string",
                      value: "m",
                    } as LiteralNode,
                  ],
                } as OperatorNode,
              ],
            } satisfies StatementNode,
          ],
          [],
        ),
      );
    });

    it("can convert relative submodules", () => {
      const ast = convertPythonToGeneralAst(
        `
from ....module.submodule import a as b
        `,
      );

      expect(ast).toEqual(
        createTopLevelPythonStatementOutput(
          [
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: `${syntheticAstFunctionPrefix}import`,
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.operator,
                  operator: "as",
                  operands: [
                    {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.literal,
                      type: "string",
                      value: "....module.submodule.a",
                    } as LiteralNode,
                    {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.literal,
                      type: "string",
                      value: "b",
                    } as LiteralNode,
                  ],
                } as OperatorNode,
              ],
            } satisfies StatementNode,
          ],
          [],
        ),
      );
    });
  });

  describe("python specific statements", () => {
    it("can convert assert statements", () => {
      const ast = convertPythonToGeneralAst(
        `
assert True, False
        `,
      );

      expect(ast).toEqual(
        createTopLevelPythonStatementOutput(
          [
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: `${syntheticAstFunctionPrefix}assert`,
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "boolean",
                  value: "true",
                } as LiteralNode,
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.literal,
                  type: "boolean",
                  value: "false",
                } as LiteralNode,
              ],
            } satisfies StatementNode,
          ],
          [],
        ),
      );
    });
  });

  describe("class declarations", () => {
    it("can convert a simple class with no members", () => {
      const ast = convertPythonToGeneralAst(`
class Empty:
    pass
      `);

      expect(ast).toEqual(
        createTopLevelPythonStatementOutput(
          [
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.classDeclaration,
              name: "Empty",
              baseClasses: [],
              body: {
                nodeType: AstNodeType.statement,
                statementType: StatementNodeType.sequence,
                statements: [],
              } satisfies StatementSequenceNode,
            } satisfies ClassDeclarationNode,
          ],
          [],
        ),
      );
    });

    it("can convert a class with attributes and methods", () => {
      const ast = convertPythonToGeneralAst(`
class Person:
    species = "Homo sapiens"
    def __init__(self, name):
        self.name = name
    def greet(self):
        return "Hello"
      `);
      expect(ast).toEqual(
        createTopLevelPythonStatementOutput(
          [
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.classDeclaration,
              name: "Person",
              baseClasses: [],
              body: {
                nodeType: AstNodeType.statement,
                statementType: StatementNodeType.sequence,
                statements: [
                  {
                    nodeType: AstNodeType.statement,
                    statementType: StatementNodeType.multiAssignment,
                    assignmentExpressions: [
                      {
                        nodeType: AstNodeType.expression,
                        expressionType: ExpressionNodeType.variable,
                        name: "species",
                      },
                    ],
                    values: [
                      {
                        nodeType: AstNodeType.expression,
                        expressionType: ExpressionNodeType.literal,
                        type: "string",
                        value: '"Homo sapiens"',
                      },
                    ],
                  },
                  {
                    nodeType: AstNodeType.statement,
                    statementType: StatementNodeType.functionDeclaration,
                    name: "__init__",
                    parameterNames: ["self", "name"],
                    body: {
                      nodeType: AstNodeType.statement,
                      statementType: StatementNodeType.sequence,
                      statements: [
                        {
                          nodeType: AstNodeType.statement,
                          statementType: StatementNodeType.multiAssignment,
                          assignmentExpressions: [
                            {
                              nodeType: AstNodeType.expression,
                              expressionType: ExpressionNodeType.operator,
                              operator: fieldAccessOperator,
                              operands: [
                                {
                                  nodeType: AstNodeType.expression,
                                  expressionType: ExpressionNodeType.variable,
                                  name: "self",
                                } satisfies VariableNode,
                                {
                                  nodeType: AstNodeType.expression,
                                  expressionType: ExpressionNodeType.literal,
                                  type: "string",
                                  value: "name",
                                } satisfies LiteralNode,
                              ],
                            },
                          ],
                          values: [
                            {
                              nodeType: AstNodeType.expression,
                              expressionType: ExpressionNodeType.variable,
                              name: "name",
                            },
                          ],
                        },
                      ],
                    } satisfies StatementSequenceNode,
                  },
                  {
                    nodeType: AstNodeType.statement,
                    statementType: StatementNodeType.functionDeclaration,
                    name: "greet",
                    parameterNames: ["self"],
                    body: {
                      nodeType: AstNodeType.statement,
                      statementType: StatementNodeType.sequence,
                      statements: [
                        {
                          nodeType: AstNodeType.statement,
                          statementType: StatementNodeType.return,
                          value: {
                            nodeType: AstNodeType.expression,
                            expressionType: ExpressionNodeType.literal,
                            type: "string",
                            value: '"Hello"',
                          },
                        },
                      ],
                    } satisfies StatementSequenceNode,
                  },
                ],
              } satisfies StatementSequenceNode,
            } satisfies ClassDeclarationNode,
          ],
          [],
        ),
      );
    });

    it("can convert a class with inheritance", () => {
      const ast = convertPythonToGeneralAst(`
class Student(Person):
    def study(self):
        pass
      `);
      expect(ast).toEqual(
        createTopLevelPythonStatementOutput(
          [
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.classDeclaration,
              name: "Student",
              baseClasses: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.variable,
                  name: "Person",
                } satisfies VariableNode,
              ],
              body: {
                nodeType: AstNodeType.statement,
                statementType: StatementNodeType.sequence,
                statements: [
                  {
                    nodeType: AstNodeType.statement,
                    statementType: StatementNodeType.functionDeclaration,
                    name: "study",
                    parameterNames: ["self"],
                    body: {
                      nodeType: AstNodeType.statement,
                      statementType: StatementNodeType.sequence,
                      statements: [],
                    } satisfies StatementSequenceNode,
                  },
                ],
              } satisfies StatementSequenceNode,
            } satisfies ClassDeclarationNode,
          ],
          [],
        ),
      );
    });
  });

  it("can convert a class with a decorator", () => {
    const ast = convertPythonToGeneralAst(`
@my_decorator("argument")
class MyClass:
    pass
      `);

    expect(ast).toEqual(
      createTopLevelPythonStatementOutput(
        [
          {
            nodeType: AstNodeType.statement,
            statementType: StatementNodeType.classDeclaration,
            name: "MyClass",
            baseClasses: [],
            decorators: [
              {
                nodeType: AstNodeType.expression,
                expressionType: ExpressionNodeType.functionCall,
                name: "my_decorator",
                arguments: [
                  {
                    nodeType: AstNodeType.expression,
                    expressionType: ExpressionNodeType.literal,
                    type: "string",
                    value: '"argument"',
                  },
                ],
              } satisfies FunctionCallExpressionNode,
            ],
            body: {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.sequence,
              statements: [],
            } satisfies StatementSequenceNode,
          } satisfies ClassDeclarationNode,
        ],
        [],
      ),
    );
  });

  describe("pattern matching", () => {
    it("can convert a simple match statement", () => {
      const ast = convertPythonToGeneralAst(`
match x:
    case 1:
        y = "one"
      `);
      expect(ast).toEqual(
        createTopLevelPythonStatementOutput(
          [
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: `${syntheticAstFunctionPrefix}match`,
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.variable,
                  name: "x",
                } satisfies VariableNode,
              ],
            } satisfies FunctionCallNode,
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.sequence,
              statements: [
                {
                  nodeType: AstNodeType.statement,
                  statementType: StatementNodeType.functionCall,
                  name: `${syntheticAstFunctionPrefix}case`,
                  arguments: [
                    {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.literal,
                      type: "number",
                      value: "1",
                    } satisfies LiteralNode,
                  ],
                } satisfies FunctionCallNode,
                {
                  nodeType: AstNodeType.statement,
                  statementType: StatementNodeType.sequence,
                  statements: [
                    {
                      nodeType: AstNodeType.statement,
                      statementType: StatementNodeType.multiAssignment,
                      assignmentExpressions: [
                        {
                          nodeType: AstNodeType.expression,
                          expressionType: ExpressionNodeType.variable,
                          name: "y",
                        },
                      ],
                      values: [
                        {
                          nodeType: AstNodeType.expression,
                          expressionType: ExpressionNodeType.literal,
                          type: "string",
                          value: '"one"',
                        },
                      ],
                    },
                  ],
                } satisfies StatementSequenceNode,
              ],
            },
          ],
          [],
        ),
      );
    });

    it("can convert a match with multiple cases and guards", () => {
      const ast = convertPythonToGeneralAst(`
match value:
    case 0:
        result = "zero"
    case n if n > 0:
        result = "positive"
    case _:
        result = "other"
      `);
      expect(ast).toEqual(
        createTopLevelPythonStatementOutput(
          [
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: `${syntheticAstFunctionPrefix}match`,
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.variable,
                  name: "value",
                } satisfies VariableNode,
              ],
            } satisfies FunctionCallNode,
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.sequence,
              statements: [
                {
                  nodeType: AstNodeType.statement,
                  statementType: StatementNodeType.functionCall,
                  name: `${syntheticAstFunctionPrefix}case`,
                  arguments: [
                    {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.literal,
                      type: "number",
                      value: "0",
                    } satisfies LiteralNode,
                  ],
                } satisfies FunctionCallNode,
                {
                  nodeType: AstNodeType.statement,
                  statementType: StatementNodeType.sequence,
                  statements: [
                    {
                      nodeType: AstNodeType.statement,
                      statementType: StatementNodeType.multiAssignment,
                      assignmentExpressions: [
                        {
                          nodeType: AstNodeType.expression,
                          expressionType: ExpressionNodeType.variable,
                          name: "result",
                        },
                      ],
                      values: [
                        {
                          nodeType: AstNodeType.expression,
                          expressionType: ExpressionNodeType.literal,
                          type: "string",
                          value: '"zero"',
                        },
                      ],
                    },
                  ],
                } satisfies StatementSequenceNode,
                {
                  nodeType: AstNodeType.statement,
                  statementType: StatementNodeType.functionCall,
                  name: `${syntheticAstFunctionPrefix}case`,
                  arguments: [
                    {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.variable,
                      name: "n",
                    } satisfies VariableNode,
                    {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.operator,
                      operator: "guard",
                      operands: [
                        {
                          nodeType: AstNodeType.expression,
                          expressionType: ExpressionNodeType.operator,
                          operator: greaterThanOperator,
                          operands: [
                            {
                              nodeType: AstNodeType.expression,
                              expressionType: ExpressionNodeType.variable,
                              name: "n",
                            } satisfies VariableNode,
                            {
                              nodeType: AstNodeType.expression,
                              expressionType: ExpressionNodeType.literal,
                              type: "number",
                              value: "0",
                            } satisfies LiteralNode,
                          ],
                        } satisfies OperatorNode,
                      ],
                    } satisfies OperatorNode,
                  ],
                } satisfies FunctionCallNode,
                {
                  nodeType: AstNodeType.statement,
                  statementType: StatementNodeType.sequence,
                  statements: [
                    {
                      nodeType: AstNodeType.statement,
                      statementType: StatementNodeType.multiAssignment,
                      assignmentExpressions: [
                        {
                          nodeType: AstNodeType.expression,
                          expressionType: ExpressionNodeType.variable,
                          name: "result",
                        },
                      ],
                      values: [
                        {
                          nodeType: AstNodeType.expression,
                          expressionType: ExpressionNodeType.literal,
                          type: "string",
                          value: '"positive"',
                        },
                      ],
                    },
                  ],
                } satisfies StatementSequenceNode,
                {
                  nodeType: AstNodeType.statement,
                  statementType: StatementNodeType.functionCall,
                  name: `${syntheticAstFunctionPrefix}case`,
                  arguments: [
                    {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.literal,
                      type: "wildcard",
                      value: "",
                    } satisfies LiteralNode,
                  ],
                } satisfies FunctionCallNode,
                {
                  nodeType: AstNodeType.statement,
                  statementType: StatementNodeType.sequence,
                  statements: [
                    {
                      nodeType: AstNodeType.statement,
                      statementType: StatementNodeType.multiAssignment,
                      assignmentExpressions: [
                        {
                          nodeType: AstNodeType.expression,
                          expressionType: ExpressionNodeType.variable,
                          name: "result",
                        } satisfies VariableNode,
                      ],
                      values: [
                        {
                          nodeType: AstNodeType.expression,
                          expressionType: ExpressionNodeType.literal,
                          type: "string",
                          value: '"other"',
                        } satisfies LiteralNode,
                      ],
                    },
                  ],
                } satisfies StatementSequenceNode,
              ],
            } satisfies StatementSequenceNode,
          ],
          [],
        ),
      );
    });

    it("can convert a match with destructuring", () => {
      const ast = convertPythonToGeneralAst(`
match point:
    case (0, y):
        result = y
    case (x, 0):
        result = x
      `);
      expect(ast).toEqual(
        createTopLevelPythonStatementOutput(
          [
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.functionCall,
              name: `${syntheticAstFunctionPrefix}match`,
              arguments: [
                {
                  nodeType: AstNodeType.expression,
                  expressionType: ExpressionNodeType.variable,
                  name: "point",
                } satisfies VariableNode,
              ],
            } satisfies FunctionCallNode,
            {
              nodeType: AstNodeType.statement,
              statementType: StatementNodeType.sequence,
              statements: [
                {
                  nodeType: AstNodeType.statement,
                  statementType: StatementNodeType.functionCall,
                  name: `${syntheticAstFunctionPrefix}case`,
                  arguments: [
                    {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.operator,
                      operator: "sequence-pattern-(",
                      operands: [
                        {
                          nodeType: AstNodeType.expression,
                          expressionType: ExpressionNodeType.literal,
                          type: "number",
                          value: "0",
                        } satisfies LiteralNode,
                        {
                          nodeType: AstNodeType.expression,
                          expressionType: ExpressionNodeType.variable,
                          name: "y",
                        } satisfies VariableNode,
                      ],
                    } satisfies OperatorNode,
                  ],
                } satisfies FunctionCallNode,
                {
                  nodeType: AstNodeType.statement,
                  statementType: StatementNodeType.sequence,
                  statements: [
                    {
                      nodeType: AstNodeType.statement,
                      statementType: StatementNodeType.multiAssignment,
                      assignmentExpressions: [
                        {
                          nodeType: AstNodeType.expression,
                          expressionType: ExpressionNodeType.variable,
                          name: "result",
                        },
                      ],
                      values: [
                        {
                          nodeType: AstNodeType.expression,
                          expressionType: ExpressionNodeType.variable,
                          name: "y",
                        } satisfies VariableNode,
                      ],
                    },
                  ],
                } satisfies StatementSequenceNode,
                {
                  nodeType: AstNodeType.statement,
                  statementType: StatementNodeType.functionCall,
                  name: `${syntheticAstFunctionPrefix}case`,
                  arguments: [
                    {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.operator,
                      operator: "sequence-pattern-(",
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
                          value: "0",
                        } satisfies LiteralNode,
                      ],
                    } satisfies OperatorNode,
                  ],
                } satisfies FunctionCallNode,
                {
                  nodeType: AstNodeType.statement,
                  statementType: StatementNodeType.sequence,
                  statements: [
                    {
                      nodeType: AstNodeType.statement,
                      statementType: StatementNodeType.multiAssignment,
                      assignmentExpressions: [
                        {
                          nodeType: AstNodeType.expression,
                          expressionType: ExpressionNodeType.variable,
                          name: "result",
                        },
                      ],
                      values: [
                        {
                          nodeType: AstNodeType.expression,
                          expressionType: ExpressionNodeType.variable,
                          name: "x",
                        } satisfies VariableNode,
                      ],
                    },
                  ],
                } satisfies StatementSequenceNode,
              ],
            },
          ],
          [],
        ),
      );
    });
  });
});
