import { AstNodeType } from "@ast/ast-node-type";
import { ExpressionNodeType } from "@ast/ast-nodes/expression-node";
import { StatementNodeType } from "@ast/ast-nodes";
import { GeneralAst } from "@ast/index";
import { computeHeight } from "../../ast-height";

describe("Criteria Based Analyzer", () => {
  describe("height", () => {
    it("returns '0' if the AST does not have any actors", () => {
      const output = computeHeight([], undefined);

      expect(output).toBe(0);
    });

    it("returns '1' if the AST contains an actor", () => {
      const output = computeHeight(
        [
          {
            nodeType: AstNodeType.actor,
            eventListeners: [],
            functionDeclarations: [],
          },
        ] as GeneralAst,
        undefined,
      );

      expect(output).toBe(1);
    });

    it("returns '3' if the AST contains an actor with an event listener", () => {
      const output = computeHeight(
        [
          {
            nodeType: AstNodeType.actor,
            eventListeners: [],
            functionDeclarations: [],
          },
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

      expect(output).toBe(3);
    });

    it("returns the depth of the deepest leaf", () => {
      const output = computeHeight(
        [
          {
            // Depth: 1
            nodeType: AstNodeType.actor,
            eventListeners: [],
            functionDeclarations: [],
          },
          {
            // Depth: 1
            nodeType: AstNodeType.actor,
            eventListeners: [
              {
                // Depth: 2
                nodeType: AstNodeType.eventListener,
                condition: {
                  event: "event_whengreaterthan",
                  parameters: [
                    {
                      // Depth: 3
                      nodeType: AstNodeType.expression,
                      expressionType: ExpressionNodeType.literal,
                      type: "number",
                      value: "10",
                    },
                  ],
                },
                action: {
                  // Depth: 3
                  nodeType: AstNodeType.statement,
                  statementType: StatementNodeType.sequence,
                  statements: [],
                },
              },
            ],
            functionDeclarations: [
              // Depth: 2
              {
                nodeType: AstNodeType.statement,
                statementType: StatementNodeType.functionDeclaration,
                name: "fn",
                parameterNames: [],
                body: {
                  // Depth: 3
                  nodeType: AstNodeType.statement,
                  statementType: StatementNodeType.sequence,
                  statements: [
                    // Depth: 4
                    {
                      nodeType: AstNodeType.statement,
                      statementType: StatementNodeType.functionCall,
                      name: "fn",
                      arguments: [
                        // Depth: 5
                        {
                          nodeType: AstNodeType.expression,
                          expressionType: ExpressionNodeType.literal,
                          type: "number",
                          value: "10",
                        },
                      ],
                    },
                  ],
                },
              },
            ],
          },
        ] as GeneralAst,
        undefined,
      );

      expect(output).toBe(5);
    });
  });
});
