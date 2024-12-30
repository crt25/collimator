import { AstNodeType } from "@ast/ast-node-type";
import { ExpressionNodeType } from "@ast/ast-nodes/expression-node";
import { StatementNodeType } from "@ast/ast-nodes";
import { GeneralAst } from "@ast/index";
import {
  AstCriterionType,
  CriteriaBasedAnalyzerOutput,
} from "@/data-analyzer/analyze-asts";
import { computeIndentation } from "../../indentation";

describe("Criteria Based Analyzer", () => {
  describe("indentation", () => {
    it("returns '0' if the AST contains an actor with an event listener", () => {
      const output = computeIndentation(
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

      expect(output).toBe(
        0 satisfies CriteriaBasedAnalyzerOutput[AstCriterionType.indentation],
      );
    });

    it("returns the depth of the deepest leaf", () => {
      const output = computeIndentation(
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
                  // Indentation: 0
                  nodeType: AstNodeType.statement,
                  statementType: StatementNodeType.sequence,
                  statements: [],
                },
              },
            ],
            functionDeclarations: [
              // Indentation: 0
              {
                nodeType: AstNodeType.statement,
                statementType: StatementNodeType.functionDeclaration,
                name: "fn",
                parameterNames: [],
                body: {
                  // Indentation: 1
                  nodeType: AstNodeType.statement,
                  statementType: StatementNodeType.sequence,
                  statements: [
                    // Indentation: 1
                    {
                      nodeType: AstNodeType.statement,
                      statementType: StatementNodeType.condition,
                      condition: {
                        nodeType: AstNodeType.expression,
                        expressionType: ExpressionNodeType.literal,
                        type: "boolean",
                        value: "true",
                      },
                      whenTrue: {
                        // Indentation: 2
                        nodeType: AstNodeType.statement,
                        statementType: StatementNodeType.sequence,
                        statements: [
                          {
                            // Indentation: 2
                            nodeType: AstNodeType.statement,
                            statementType: StatementNodeType.functionCall,
                            name: "fn",
                            arguments: [
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
                      whenFalse: {
                        nodeType: AstNodeType.statement,
                        statementType: StatementNodeType.sequence,
                        statements: [],
                      },
                    },
                  ],
                },
              },
            ],
          },
        ] as GeneralAst,
        undefined,
      );

      expect(output).toBe(
        2 satisfies CriteriaBasedAnalyzerOutput[AstCriterionType.indentation],
      );
    });
  });
});
