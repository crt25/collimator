import { match } from "ts-pattern";
import { CriteriaBasedAnalyzer } from "./criteria-based-analyzers";
import { GeneralAst } from "@ast/index";

export enum AstCriterionType {
  statement = "statement",
  expression = "expression",
  functionCall = "functionCall",
  loop = "loop",
  condition = "condition",
  functionDeclaration = "functionDeclaration",
}

export interface CriteriaBasedAnalyzerInput {
  [AstCriterionType.statement]: void;
  [AstCriterionType.expression]: void;
  [AstCriterionType.functionCall]: {
    functionName?: string;
  };
  [AstCriterionType.loop]: void;
  [AstCriterionType.condition]: void;
  [AstCriterionType.functionDeclaration]: void;
}

export interface CriteriaBasedAnalyzerOutput {
  [AstCriterionType.statement]: number;
  [AstCriterionType.expression]: number;
  [AstCriterionType.functionCall]: number;
  [AstCriterionType.loop]: number;
  [AstCriterionType.condition]: number;
  [AstCriterionType.functionDeclaration]: number;
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
    input: CriteriaToAnalyzeInput<AstCriterionType.statement>,
  ): CriteriaToAnalyzeOutput<AstCriterionType.statement>;
  (
    ast: GeneralAst,
    input: CriteriaToAnalyzeInput<AstCriterionType.expression>,
  ): CriteriaToAnalyzeOutput<AstCriterionType.expression>;
  (
    ast: GeneralAst,
    input: CriteriaToAnalyzeInput<AstCriterionType.functionCall>,
  ): CriteriaToAnalyzeOutput<AstCriterionType.functionCall>;
  (
    ast: GeneralAst,
    input: CriteriaToAnalyzeInput<AstCriterionType.condition>,
  ): CriteriaToAnalyzeOutput<AstCriterionType.condition>;
  (
    ast: GeneralAst,
    input: CriteriaToAnalyzeInput<AstCriterionType.functionDeclaration>,
  ): CriteriaToAnalyzeOutput<AstCriterionType.functionDeclaration>;
  (
    ast: GeneralAst,
    input: CriteriaToAnalyzeInput<AstCriterionType.loop>,
  ): CriteriaToAnalyzeOutput<AstCriterionType.loop>;
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
      { criterion: AstCriterionType.functionCall },
      ({ criterion, input }) => ({
        criterion,
        output: CriteriaBasedAnalyzer.countFunctionCalls(ast, input),
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
