import { match } from "ts-pattern";
import { GeneralAst } from "@ast/index";
import { CriteriaBasedAnalyzer } from "./criteria-based-analyzers";

export enum AstCriterionType {
  condition = "condition",
  customFunctionCall = "customFunctionCall",
  expression = "expression",
  builtInFunctionCall = "builtInFunctionCall",
  functionDeclaration = "functionDeclaration",
  height = "height",
  indentation = "indentation",
  loop = "loop",
  statement = "statement",
}

export interface CriteriaBasedAnalyzerInput {
  [AstCriterionType.condition]: void;
  [AstCriterionType.customFunctionCall]: void;
  [AstCriterionType.expression]: void;
  [AstCriterionType.functionDeclaration]: void;
  [AstCriterionType.builtInFunctionCall]: {
    functionName?: string;
  };
  [AstCriterionType.height]: void;
  [AstCriterionType.indentation]: void;
  [AstCriterionType.loop]: void;
  [AstCriterionType.statement]: void;
}

export interface CriteriaBasedAnalyzerOutput {
  [AstCriterionType.condition]: number;
  [AstCriterionType.customFunctionCall]: number;
  [AstCriterionType.expression]: number;
  [AstCriterionType.builtInFunctionCall]: {
    numberOfCalls: number;
    callsByFunctionName: Record<string, number>;
  };
  [AstCriterionType.functionDeclaration]: number;
  [AstCriterionType.height]: number;
  [AstCriterionType.indentation]: number;
  [AstCriterionType.loop]: number;
  [AstCriterionType.statement]: number;
}

export type CriteriaToAnalyzeInput<T extends AstCriterionType> = {
  criterion: T;
  input: CriteriaBasedAnalyzerInput[T];
};

export type CriteriaToAnalyzeOutput<T extends AstCriterionType> = {
  criterion: T;
  output: CriteriaBasedAnalyzerOutput[T];
};

type AnalysisFunction = {
  (
    ast: GeneralAst,
    input: CriteriaToAnalyzeInput<AstCriterionType.condition>,
  ): CriteriaToAnalyzeOutput<AstCriterionType.condition>;
  (
    ast: GeneralAst,
    input: CriteriaToAnalyzeInput<AstCriterionType.customFunctionCall>,
  ): CriteriaToAnalyzeOutput<AstCriterionType.customFunctionCall>;
  (
    ast: GeneralAst,
    input: CriteriaToAnalyzeInput<AstCriterionType.expression>,
  ): CriteriaToAnalyzeOutput<AstCriterionType.expression>;
  (
    ast: GeneralAst,
    input: CriteriaToAnalyzeInput<AstCriterionType.builtInFunctionCall>,
  ): CriteriaToAnalyzeOutput<AstCriterionType.builtInFunctionCall>;
  (
    ast: GeneralAst,
    input: CriteriaToAnalyzeInput<AstCriterionType.functionDeclaration>,
  ): CriteriaToAnalyzeOutput<AstCriterionType.functionDeclaration>;
  (
    ast: GeneralAst,
    input: CriteriaToAnalyzeInput<AstCriterionType.height>,
  ): CriteriaToAnalyzeOutput<AstCriterionType.height>;
  (
    ast: GeneralAst,
    input: CriteriaToAnalyzeInput<AstCriterionType.indentation>,
  ): CriteriaToAnalyzeOutput<AstCriterionType.indentation>;
  (
    ast: GeneralAst,
    input: CriteriaToAnalyzeInput<AstCriterionType.loop>,
  ): CriteriaToAnalyzeOutput<AstCriterionType.loop>;
  (
    ast: GeneralAst,
    input: CriteriaToAnalyzeInput<AstCriterionType.statement>,
  ): CriteriaToAnalyzeOutput<AstCriterionType.statement>;
};

// @ts-expect-error Not sure how to fix the typescript issue
export const analyzeAst: AnalysisFunction = (ast, input) =>
  match(input)
    .with(
      { criterion: AstCriterionType.statement },
      ({ criterion, input }) => ({
        criterion,
        output: CriteriaBasedAnalyzer.countStatements(ast, input),
      }),
    )
    .with(
      { criterion: AstCriterionType.expression },
      ({ criterion, input }) => ({
        criterion,
        output: CriteriaBasedAnalyzer.countExpressions(ast, input),
      }),
    )
    .with(
      { criterion: AstCriterionType.customFunctionCall },
      ({ criterion, input }) => ({
        criterion,
        output: CriteriaBasedAnalyzer.countCustomFunctionCalls(ast, input),
      }),
    )
    .with(
      { criterion: AstCriterionType.builtInFunctionCall },
      ({ criterion, input }) => ({
        criterion,
        output: CriteriaBasedAnalyzer.countFunctionCalls(ast, input),
      }),
    )
    .with({ criterion: AstCriterionType.height }, ({ criterion, input }) => ({
      criterion,
      output: CriteriaBasedAnalyzer.computeHeight(ast, input),
    }))
    .with(
      { criterion: AstCriterionType.indentation },
      ({ criterion, input }) => ({
        criterion,
        output: CriteriaBasedAnalyzer.computeHeight(ast, input),
      }),
    )
    .with({ criterion: AstCriterionType.loop }, ({ criterion, input }) => ({
      criterion,
      output: CriteriaBasedAnalyzer.countLoops(ast, input),
    }))
    .with(
      { criterion: AstCriterionType.condition },
      ({ criterion, input }) => ({
        criterion,
        output: CriteriaBasedAnalyzer.countConditions(ast, input),
      }),
    )
    .with(
      { criterion: AstCriterionType.functionDeclaration },
      ({ criterion, input }) => ({
        criterion,
        output: CriteriaBasedAnalyzer.countFunctionDeclaration(ast, input),
      }),
    )
    .exhaustive();
