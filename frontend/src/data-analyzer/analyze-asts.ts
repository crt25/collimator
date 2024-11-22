import { match } from "ts-pattern";
import { CriteriaBasedAnalyzer } from "./criteria-based-analyzers";
import { GeneralAst } from "@ast/index";

export enum CriterionType {
  none = "none",
  callsFunction = "callsFunction",
  containsLoop = "containsLoop",
  condition = "containsCondition",
  containsFunctionDeclaration = "containsFunctionDeclaration",
}

export interface CriteriaBasedAnalyzerInput {
  [CriterionType.none]: void;
  [CriterionType.callsFunction]: {
    functionName: string;
  };
  [CriterionType.containsLoop]: void;
  [CriterionType.condition]: void;
  [CriterionType.containsFunctionDeclaration]: void;
}

export interface CriteriaBasedAnalyzerOutput {
  [CriterionType.none]: void;
  [CriterionType.callsFunction]: boolean;
  [CriterionType.containsLoop]: boolean;
  [CriterionType.condition]: boolean;
  [CriterionType.containsFunctionDeclaration]: boolean;
}

export type CriteriaToAnalyzeInput<T extends CriterionType> = {
  criterion: T;
  input: CriteriaBasedAnalyzerInput[T];
};

export type AnalysisInput =
  | CriteriaToAnalyzeInput<CriterionType.callsFunction>
  | CriteriaToAnalyzeInput<CriterionType.condition>
  | CriteriaToAnalyzeInput<CriterionType.containsFunctionDeclaration>
  | CriteriaToAnalyzeInput<CriterionType.containsLoop>;

export type CriteriaToAnalyzeOutput<T extends CriterionType> = {
  criterion: T;
  output: CriteriaBasedAnalyzerOutput[T];
};

export type AnalysisOutput =
  | CriteriaToAnalyzeOutput<CriterionType.callsFunction>
  | CriteriaToAnalyzeOutput<CriterionType.condition>
  | CriteriaToAnalyzeOutput<CriterionType.containsFunctionDeclaration>
  | CriteriaToAnalyzeOutput<CriterionType.containsLoop>;

export const analyzeAsts = ({
  asts,
  input,
}: {
  asts: GeneralAst[];
  input: AnalysisInput[];
}): AnalysisOutput[][] =>
  asts.map((ast) =>
    input.map((input) =>
      match(input)
        .returnType<AnalysisOutput>()
        .with(
          { criterion: CriterionType.callsFunction },
          ({ criterion, input }) => ({
            criterion,
            output: CriteriaBasedAnalyzer.callsFunction(ast, input),
          }),
        )
        .with(
          { criterion: CriterionType.containsLoop },
          ({ criterion, input }) => ({
            criterion,
            output: CriteriaBasedAnalyzer.containsLoop(ast, input),
          }),
        )
        .with(
          { criterion: CriterionType.condition },
          ({ criterion, input }) => ({
            criterion,
            output: CriteriaBasedAnalyzer.containsCondition(ast, input),
          }),
        )
        .with(
          { criterion: CriterionType.containsFunctionDeclaration },
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
