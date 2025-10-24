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
import { FunctionCallExpressionNode } from "src/ast/types/general-ast/ast-nodes/expression-node/function-call-node";
import { LambdaNode } from "src/ast/types/general-ast/ast-nodes/expression-node/lambda-node";
import { ReturnNode } from "src/ast/types/general-ast/ast-nodes/statement-node/return-node";
import {
  convertPythonToGeneralAst,
  createTopLevelPythonStatementOutput,
} from "../";
import { equalityOperator } from "../operators";

describe("Python AST converter", () => {
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
});
