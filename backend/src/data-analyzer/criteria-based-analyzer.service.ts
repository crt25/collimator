import { Injectable } from "@nestjs/common";
import { GeneralAst } from "src/ast/types/general-ast";
import { CriteriaBasedAnalyzer } from "./criteria-based-analyzers";

export enum Criteria {
  callsFunction = "callsFunction",
  containsLoop = "containsLoop",
  containsCondition = "containsCondition",
  containsFunctionDeclaration = "containsFunctionDeclaration",
}

export interface CriteriaBasedAnalyzerInput {
  [Criteria.callsFunction]?: {
    functionName: string;
  };
  [Criteria.containsLoop]?: true;
  [Criteria.containsCondition]?: true;
  [Criteria.containsFunctionDeclaration]?: true;
}

export interface CriteriaBasedAnalyzerOutput {
  [Criteria.callsFunction]?: boolean;
  [Criteria.containsLoop]?: boolean;
  [Criteria.containsCondition]?: boolean;
  [Criteria.containsFunctionDeclaration]?: boolean;
}

@Injectable()
export class CriteriaBasedAnalyzerService {
  analyze(
    submission: GeneralAst,
    input: CriteriaBasedAnalyzerInput,
  ): CriteriaBasedAnalyzerOutput {
    return {
      [Criteria.callsFunction]:
        input[Criteria.callsFunction] &&
        CriteriaBasedAnalyzer.callsFunction(
          submission,
          input[Criteria.callsFunction],
        ),

      [Criteria.containsLoop]:
        input[Criteria.containsLoop] &&
        CriteriaBasedAnalyzer.containsLoop(
          submission,
          input[Criteria.containsLoop],
        ),

      [Criteria.containsCondition]:
        input[Criteria.containsCondition] &&
        CriteriaBasedAnalyzer.containsCondition(
          submission,
          input[Criteria.containsCondition],
        ),

      [Criteria.containsFunctionDeclaration]:
        input[Criteria.containsFunctionDeclaration] &&
        CriteriaBasedAnalyzer.containsFunctionDeclaration(
          submission,
          input[Criteria.containsFunctionDeclaration],
        ),
    };
  }
}
