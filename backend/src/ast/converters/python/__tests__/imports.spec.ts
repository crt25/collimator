import { AstNodeType } from "src/ast/types/general-ast";
import {
  StatementNode,
  StatementNodeType,
} from "src/ast/types/general-ast/ast-nodes";
import {
  ExpressionNodeType,
  LiteralNode,
  OperatorNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import {
  convertPythonToGeneralAst,
  createTopLevelPythonStatementOutput,
} from "../";
import { syntheticAstFunctionPrefix } from "../constants";
import { renameImportOperator } from "../operators";

const version = "3.9.1";

describe("Python AST converter", () => {
  describe("imports", () => {
    it("can convert simple imports", () => {
      const ast = convertPythonToGeneralAst(
        `
import numpy
        `,
        version,
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
        version,
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
                  operator: renameImportOperator,
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
        version,
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
                  operator: renameImportOperator,
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
        version,
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
                  operator: renameImportOperator,
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
        version,
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
                  operator: renameImportOperator,
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
});
