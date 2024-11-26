import { match } from "ts-pattern";
import { CriteriaBasedAnalyzer } from "./criteria-based-analyzers";
import { GeneralAst } from "@ast/index";

export enum CriterionType {
  none = "none",
  statement = "statement",
  expression = "expression",
  functionCall = "functionCall",
  loop = "loop",
  condition = "condition",
  functionDeclaration = "functionDeclaration",
}

export interface CriteriaBasedAnalyzerInput {
  [CriterionType.none]: void;
  [CriterionType.statement]: void;
  [CriterionType.expression]: void;
  [CriterionType.functionCall]: {
    functionName?: string;
  };
  [CriterionType.loop]: void;
  [CriterionType.condition]: void;
  [CriterionType.functionDeclaration]: void;
}

export interface CriteriaBasedAnalyzerOutput {
  [CriterionType.none]: void;
  [CriterionType.statement]: number;
  [CriterionType.expression]: number;
  [CriterionType.functionCall]: number;
  [CriterionType.loop]: number;
  [CriterionType.condition]: number;
  [CriterionType.functionDeclaration]: number;
}

export type CriteriaToAnalyzeInput<T extends CriterionType> = {
  criterion: T;
  input: CriteriaBasedAnalyzerInput[T];
};

export type CriteriaToAnalyzeOutput<T extends CriterionType> = {
  criterion: T;
  output: CriteriaBasedAnalyzerOutput[T];
};

type AnalysisFunction = {
  (
    ast: GeneralAst,
    input: CriteriaToAnalyzeInput<CriterionType.statement>,
  ): CriteriaToAnalyzeOutput<CriterionType.statement>;
  (
    ast: GeneralAst,
    input: CriteriaToAnalyzeInput<CriterionType.expression>,
  ): CriteriaToAnalyzeOutput<CriterionType.expression>;
  (
    ast: GeneralAst,
    input: CriteriaToAnalyzeInput<CriterionType.functionCall>,
  ): CriteriaToAnalyzeOutput<CriterionType.functionCall>;
  (
    ast: GeneralAst,
    input: CriteriaToAnalyzeInput<CriterionType.condition>,
  ): CriteriaToAnalyzeOutput<CriterionType.condition>;
  (
    ast: GeneralAst,
    input: CriteriaToAnalyzeInput<CriterionType.functionDeclaration>,
  ): CriteriaToAnalyzeOutput<CriterionType.functionDeclaration>;
  (
    ast: GeneralAst,
    input: CriteriaToAnalyzeInput<CriterionType.loop>,
  ): CriteriaToAnalyzeOutput<CriterionType.loop>;
};

// @ts-expect-error Not sure how to fix the typescript issue
export const analyzeAst: AnalysisFunction = (ast, input) =>
  match(input)
    .with({ criterion: CriterionType.statement }, ({ criterion, input }) => ({
      criterion,
      output: CriteriaBasedAnalyzer.countStatements(ast, input),
    }))
    .with({ criterion: CriterionType.expression }, ({ criterion, input }) => ({
      criterion,
      output: CriteriaBasedAnalyzer.countExpressions(ast, input),
    }))
    .with(
      { criterion: CriterionType.functionCall },
      ({ criterion, input }) => ({
        criterion,
        output: CriteriaBasedAnalyzer.countFunctionCalls(ast, input),
      }),
    )
    .with({ criterion: CriterionType.loop }, ({ criterion, input }) => ({
      criterion,
      output: CriteriaBasedAnalyzer.countLoops(ast, input),
    }))
    .with({ criterion: CriterionType.condition }, ({ criterion, input }) => ({
      criterion,
      output: CriteriaBasedAnalyzer.countConditions(ast, input),
    }))
    .with(
      { criterion: CriterionType.functionDeclaration },
      ({ criterion, input }) => ({
        criterion,
        output: CriteriaBasedAnalyzer.countFunctionDeclaration(ast, input),
      }),
    )
    .exhaustive();
