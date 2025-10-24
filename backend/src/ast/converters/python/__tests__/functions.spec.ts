import { AstNodeType } from "src/ast/types/general-ast";
import {
  FunctionDeclarationNode,
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
import { sliceOperator } from "../operators";

describe("Python AST converter", () => {
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
                      operator: sliceOperator,
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
});
