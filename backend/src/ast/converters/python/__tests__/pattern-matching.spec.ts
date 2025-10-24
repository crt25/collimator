import { AstNodeType } from "src/ast/types/general-ast";
import {
  FunctionCallNode,
  StatementNodeType,
} from "src/ast/types/general-ast/ast-nodes";
import {
  ExpressionNodeType,
  LiteralNode,
  OperatorNode,
  VariableNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { StatementSequenceNode } from "src/ast/types/general-ast/ast-nodes/statement-node/statement-sequence-node";
import {
  convertPythonToGeneralAst,
  createTopLevelPythonStatementOutput,
} from "../";
import { syntheticAstFunctionPrefix } from "../constants";
import {
  greaterThanOperator,
  patternGuardOperator,
  sequencePatternOperator,
} from "../operators";

describe("Python AST converter", () => {
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
                      operator: patternGuardOperator,
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
                      operator: sequencePatternOperator,
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
                      operator: sequencePatternOperator,
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
