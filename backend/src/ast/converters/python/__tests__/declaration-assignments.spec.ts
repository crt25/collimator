import { AstNodeType } from "src/ast/types/general-ast";
import {
  StatementNode,
  StatementNodeType,
} from "src/ast/types/general-ast/ast-nodes";
import {
  ExpressionNodeType,
  LiteralNode,
  OperatorNode,
  VariableNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { ExpressionSequenceNode } from "src/ast/types/general-ast/ast-nodes/expression-node/expression-sequence-node";
import {
  convertPythonToGeneralAst,
  createTopLevelPythonStatementOutput,
} from "../";
import {
  fStringConversionOperator,
  fStringFormatSpecOperator,
  fStringOperator,
  fStringReplacementFieldOperator,
  implicitConcatOperator,
} from "../operators";

const version = "3.9.1";

describe("Python AST converter", () => {
  describe("declarations and assignments", () => {
    it("can convert variable declarations", () => {
      const ast = convertPythonToGeneralAst(
        `
x: int
        `,
        version,
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
                  operator: implicitConcatOperator,
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
});
