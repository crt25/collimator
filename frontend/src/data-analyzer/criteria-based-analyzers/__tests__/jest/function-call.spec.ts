import { AstNodeType } from "@ast/ast-node-type";
import { ExpressionNodeType } from "@ast/ast-nodes/expression-node";
import { StatementNodeType } from "@ast/ast-nodes";
import { GeneralAst } from "@ast/index";
import { countFunctionCalls } from "../../calls-function";
import {
  AstCriterionType,
  CriteriaBasedAnalyzerOutput,
} from "@/data-analyzer/analyze-asts";

describe("Criteria Based Analyzer", () => {
  describe("callsFunction", () => {
    it("returns '1' if the function is called in a statement", () => {
      const output = countFunctionCalls(
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

      expect(output).toEqual({
        callsByFunctionName: {
          motion_movesteps: 1,
        },
        numberOfCalls: 1,
      } satisfies CriteriaBasedAnalyzerOutput[AstCriterionType.functionCall]);
    });

    it("returns '1' if the function is called in an expression", () => {
      const output = countFunctionCalls(
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

      expect(output).toEqual({
        callsByFunctionName: {
          myFunction: 1,
        },
        numberOfCalls: 1,
      } satisfies CriteriaBasedAnalyzerOutput[AstCriterionType.functionCall]);
    });

    it("adds together the number of function calls in statements and expressions", () => {
      const output = countFunctionCalls(
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
                  statements: [
                    {
                      nodeType: AstNodeType.statement,
                      statementType: StatementNodeType.functionCall,
                      name: "myFunction",
                      arguments: [],
                    },
                    {
                      nodeType: AstNodeType.statement,
                      statementType: StatementNodeType.functionCall,
                      name: "myFunction",
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
          functionName: "myFunction",
        },
      );

      expect(output).toEqual({
        callsByFunctionName: {
          myFunction: 3,
        },
        numberOfCalls: 3,
      } satisfies CriteriaBasedAnalyzerOutput[AstCriterionType.functionCall]);
    });

    it("returns '0' if the function is not called", () => {
      const output = countFunctionCalls(
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

      expect(output).toEqual({
        callsByFunctionName: {
          myFunction1: 1,
          myFunction2: 1,
        },

        numberOfCalls: 0,
      } satisfies CriteriaBasedAnalyzerOutput[AstCriterionType.functionCall]);
    });
  });
});
