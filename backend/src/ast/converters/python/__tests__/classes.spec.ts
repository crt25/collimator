import { AstNodeType } from "src/ast/types/general-ast";
import { StatementNodeType } from "src/ast/types/general-ast/ast-nodes";
import {
  ExpressionNodeType,
  LiteralNode,
  VariableNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import { StatementSequenceNode } from "src/ast/types/general-ast/ast-nodes/statement-node/statement-sequence-node";
import { FunctionCallExpressionNode } from "src/ast/types/general-ast/ast-nodes/expression-node/function-call-node";
import { ClassDeclarationNode } from "src/ast/types/general-ast/ast-nodes/statement-node/class-declaration-node";
import {
  convertPythonToGeneralAst,
  createTopLevelPythonStatementOutput,
} from "../";
import { fieldAccessOperator } from "../operators";

const version = "3.9.1";

describe("Python AST converter", () => {
  describe("class declarations", () => {
    it("can convert a simple class with no members", () => {
      const ast = convertPythonToGeneralAst(
        `
class Empty:
    pass
      `,
        version,
      );

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
      const ast = convertPythonToGeneralAst(
        `
class Person:
    species = "Homo sapiens"
    def __init__(self, name):
        self.name = name
    def greet(self):
        return "Hello"
      `,
        version,
      );
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
      const ast = convertPythonToGeneralAst(
        `
class Student(Person):
    def study(self):
        pass
      `,
        version,
      );
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
    const ast = convertPythonToGeneralAst(
      `
@my_decorator("argument")
class MyClass:
    pass
      `,
      version,
    );

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
});
