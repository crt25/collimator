import { AstNodeType } from "src/ast/types/general-ast";
import {
  StatementNode,
  StatementNodeType,
} from "src/ast/types/general-ast/ast-nodes";
import {
  ExpressionNodeType,
  LiteralNode,
  VariableNode,
} from "src/ast/types/general-ast/ast-nodes/expression-node";
import {
  convertJupyterToGeneralAst,
  createTopLevelJupyterStatementOutput,
} from "..";

describe("Jupyter Python AST converter", () => {
  describe("declarations and assignments", () => {
    it("can convert simple variable assignments", () => {
      const ast = convertJupyterToGeneralAst({
        nbformat: 4,
        nbformat_minor: 0,
        metadata: {
          language_info: {
            name: "python",
            version: "3.10.4",
          },
        },
        cells: [
          {
            id: "my_id",
            cell_type: "code",
            source: `
x = 1
        `,
            outputs: [],
            execution_count: 0,
            metadata: {},
          },
        ],
      });

      expect(ast).toEqual(
        createTopLevelJupyterStatementOutput([
          {
            id: "my_id",
            code: [
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
            functionDeclarations: [],
          },
        ]),
      );
    });
  });
});
