import { AstNodeType } from "@ast/ast-node-type";
import { ExpressionNodeType } from "@ast/ast-nodes/expression-node";
import { StatementNodeType } from "@ast/ast-nodes";
import { GeneralAst } from "@ast/index";
import { countLoops } from "../../loop";

describe("Criteria Based Analyzer", () => {
  describe("containsLoop", () => {
    it("returns '1' if the AST contains a loop", () => {
      const output = countLoops(
        [
          {
            nodeType: AstNodeType.actor,
            eventListeners: [
              {
                nodeType: AstNodeType.eventListener,
                condition: {
                  event: "event_whengreaterthan",
                  parameters: [
                    {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.literal,
                      type: "number",
                      value: "10",
                    },
                    {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.literal,
                      type: "string",
                      value: "LOUDNESS",
                    },
                  ],
                },
                action: {
                  nodeType: AstNodeType.statement,
                  statementType: StatementNodeType.sequence,
                  statements: [
                    {
                      nodeType: AstNodeType.statement,
                      statementType: StatementNodeType.loop,
                      condition: {
                        nodeType: AstNodeType.expression,
                        expressionType: ExpressionNodeType.literal,
                        type: "boolean",
                        value: "true",
                      },
                      body: {
                        nodeType: AstNodeType.statement,
                        statementType: StatementNodeType.sequence,
                        statements: [],
                      },
                    },
                  ],
                },
              },
            ],
            functionDeclarations: [
              {
                nodeType: AstNodeType.statement,
                statementType: StatementNodeType.functionDeclaration,
                name: "myFunction",
                parameterNames: [],
                body: {
                  nodeType: AstNodeType.statement,
                  statementType: StatementNodeType.sequence,
                  statements: [],
                },
              },
            ],
          },
        ] as GeneralAst,
        undefined,
      );

      expect(output).toBe(1);
    });

    it("returns '0' if the AST does not contain a loop", () => {
      const output = countLoops(
        [
          {
            nodeType: AstNodeType.actor,
            eventListeners: [
              {
                nodeType: AstNodeType.eventListener,
                condition: {
                  event: "event_whengreaterthan",
                  parameters: [
                    {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.literal,
                      type: "number",
                      value: "10",
                    },
                    {
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.functionCall,
                      name: "myFunction",
                      arguments: [],
                    },
                  ],
                },
                action: {
                  nodeType: AstNodeType.statement,
                  statementType: StatementNodeType.sequence,
                  statements: [],
                },
              },
            ],
            functionDeclarations: [],
          },
        ] as GeneralAst,
        undefined,
      );

      expect(output).toBe(0);
    });
  });
});
