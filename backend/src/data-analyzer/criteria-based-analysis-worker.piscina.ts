import { match } from "ts-pattern";
import { CriteriaBasedAnalyzer } from "./criteria-based-analyzers";
import { GeneralAst } from "src/ast/types/general-ast";

export enum Criterion {
  callsFunction = "callsFunction",
  containsLoop = "containsLoop",
  containsCondition = "containsCondition",
  containsFunctionDeclaration = "containsFunctionDeclaration",
}

export interface CriteriaBasedAnalyzerInput {
  [Criterion.callsFunction]: {
    functionName: string;
  };
  [Criterion.containsLoop]: void;
  [Criterion.containsCondition]: void;
  [Criterion.containsFunctionDeclaration]: void;
}

export interface CriteriaBasedAnalyzerOutput {
  [Criterion.callsFunction]: boolean;
  [Criterion.containsLoop]: boolean;
  [Criterion.containsCondition]: boolean;
  [Criterion.containsFunctionDeclaration]: boolean;
}

export type CriteriaToAnalyzeInput<T extends Criterion> = {
  criterion: T;
  input: CriteriaBasedAnalyzerInput[T];
};

export type AnalysisInput =
  | CriteriaToAnalyzeInput<Criterion.callsFunction>
  | CriteriaToAnalyzeInput<Criterion.containsCondition>
  | CriteriaToAnalyzeInput<Criterion.containsFunctionDeclaration>
  | CriteriaToAnalyzeInput<Criterion.containsLoop>;

export type CriteriaToAnalyzeOutput<T extends Criterion> = {
  criterion: T;
  output: CriteriaBasedAnalyzerOutput[T];
};

export type AnalysisOutput =
  | CriteriaToAnalyzeOutput<Criterion.callsFunction>
  | CriteriaToAnalyzeOutput<Criterion.containsCondition>
  | CriteriaToAnalyzeOutput<Criterion.containsFunctionDeclaration>
  | CriteriaToAnalyzeOutput<Criterion.containsLoop>;

const CriteriaBasedAnalysisWorker = ({
  asts,
  input,
}: {
  asts: GeneralAst[];
  input: AnalysisInput[];
}): AnalysisOutput[][] => {
  return asts.map((ast) =>
    input.map((input) =>
      match(input)
        .returnType<AnalysisOutput>()
        .with(
          { criterion: Criterion.callsFunction },
          ({ criterion, input }) => ({
            criterion,
            output: CriteriaBasedAnalyzer.callsFunction(ast, input),
          }),
        )
        .with(
          { criterion: Criterion.containsLoop },
          ({ criterion, input }) => ({
            criterion,
            output: CriteriaBasedAnalyzer.containsLoop(ast, input),
          }),
        )
        .with(
          { criterion: Criterion.containsCondition },
          ({ criterion, input }) => ({
            criterion,
            output: CriteriaBasedAnalyzer.containsCondition(ast, input),
          }),
        )
        .with(
          { criterion: Criterion.containsFunctionDeclaration },
          ({ criterion, input }) => ({
            criterion,
            output: CriteriaBasedAnalyzer.containsFunctionDeclaration(
              ast,
              input,
            ),
          }),
        )
        .exhaustive(),
    ),
  );
};

export default CriteriaBasedAnalysisWorker;
