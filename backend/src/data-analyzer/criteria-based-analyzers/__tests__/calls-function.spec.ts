import { AstNodeType, GeneralAst } from "src/ast/types/general-ast";
import { callsFunction } from "../calls-function";
import { ExpressionNodeType } from "src/ast/types/general-ast/ast-nodes/expression-node";
import { StatementNodeType } from "src/ast/types/general-ast/ast-nodes";

describe("Criteria Based Analyzer", () => {
  describe("callsFunction", () => {
    it("returns true if the function is called in a statement", () => {
      const output = callsFunction(
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
                      statementType: StatementNodeType.functionCall,
                      name: "motion_movesteps",
                      arguments: [],
                    },
                  ],
                },
              },
            ],
            functionDeclarations: [],
          },
        ] as GeneralAst,
        {
          functionName: "motion_movesteps",
        },
      );

      expect(output).toBe(true);
    });

    it("returns true if the function is called in an expression", () => {
      const output = callsFunction(
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
        {
          functionName: "myFunction",
        },
      );

      expect(output).toBe(true);
    });

    it("returns false if the function is not called", () => {
      const output = callsFunction(
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
                      name: "myFunction1",
                      arguments: [],
                    },
                  ],
                },
                action: {
                  nodeType: AstNodeType.statement,
                  statementType: StatementNodeType.sequence,
                  statements: [
                    {
                      nodeType: AstNodeType.statement,
                      statementType: StatementNodeType.functionCall,
                      name: "myFunction2",
                      arguments: [],
                    },
                  ],
                },
              },
            ],
            functionDeclarations: [],
          },
        ] as GeneralAst,
        {
          functionName: "motion_movesteps",
        },
      );

      expect(output).toBe(false);
    });
  });
});
