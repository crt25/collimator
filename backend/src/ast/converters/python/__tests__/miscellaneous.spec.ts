import { AstNodeType } from "src/ast/types/general-ast";
import {
  StatementNode,
  StatementNodeType,
} from "src/ast/types/general-ast/ast-nodes";
import {
  ExpressionNodeType,
  LiteralNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import {
  convertPythonToGeneralAst,
  createTopLevelPythonStatementOutput,
} from "../";
import { syntheticAstFunctionPrefix } from "../constants";

describe("Python AST converter", () => {
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
});
