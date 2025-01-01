import { AstNodeType } from "@ast/ast-node-type";
import { ExpressionNodeType } from "@ast/ast-nodes/expression-node";
import { StatementNodeType } from "@ast/ast-nodes";
import { GeneralAst } from "@ast/index";
import {
  AstCriterionType,
  CriteriaBasedAnalyzerOutput,
} from "@/data-analyzer/analyze-asts";
import { countCustomFunctionCalls } from "../../custom-function-call";

describe("Criteria Based Analyzer", () => {
  describe("countCustomFunctionCalls", () => {
    it("returns '1' if the function is called in a statement", () => {
      const output = countCustomFunctionCalls([
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
                    name: "myFunction",
                    arguments: [],
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
      ] as GeneralAst);

      expect(output).toEqual(
        1 satisfies CriteriaBasedAnalyzerOutput[AstCriterionType.customFunctionCall],
      );
    });

    it("returns '1' if the function is called in an expression", () => {
      const output = countCustomFunctionCalls([
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
      ] as GeneralAst);

      expect(output).toEqual(
        1 satisfies CriteriaBasedAnalyzerOutput[AstCriterionType.customFunctionCall],
      );
    });

    it("adds together the number of function calls in statements and expressions", () => {
      const output = countCustomFunctionCalls([
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
      ] as GeneralAst);

      expect(output).toEqual(
        3 satisfies CriteriaBasedAnalyzerOutput[AstCriterionType.customFunctionCall],
      );
    });

    it("adds returns 0 if the function is not declared", () => {
      const output = countCustomFunctionCalls([
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
      ] as GeneralAst);

      expect(output).toEqual(
        0 satisfies CriteriaBasedAnalyzerOutput[AstCriterionType.customFunctionCall],
      );
    });
  });
});