import { AstNodeType } from "src/ast/types/general-ast";
import { StatementNodeType } from "src/ast/types/general-ast/ast-nodes";
import {
  ExpressionNodeType,
  LiteralNode,
  OperatorNode,
  VariableNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { ExpressionSequenceNode } from "src/ast/types/general-ast/ast-nodes/expression-node/expression-sequence-node";
import { FunctionCallExpressionNode } from "src/ast/types/general-ast/ast-nodes/expression-node/function-call-node";
import {
  convertPythonToGeneralAst,
  createTopLevelPythonStatementOutput,
} from "../";
import {
  createKeyValuePairOperator,
  dictionaryComprehensionOperator,
  forIfClauseOperator,
  lessThanOperator,
  listComprehensionOperator,
  setComprehensionOperator,
} from "../operators";

const version = "3.9.1";

describe("Python AST converter", () => {
  describe("comprehension expressions", () => {
    it("can convert list comprehensions", () => {
      const ast = convertPythonToGeneralAst(
        `
      [i*2 for i in range(10)]
        `,
        version,
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
                        operator: forIfClauseOperator,
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
        version,
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
                operator: setComprehensionOperator,
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
                        operator: forIfClauseOperator,
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
        version,
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
                        operator: forIfClauseOperator,
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
        version,
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
                        operator: forIfClauseOperator,
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
});
