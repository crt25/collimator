import { Criterion } from "src/data-analyzer/criteria-based-analysis-worker.piscina";

export abstract class AnalysisCriterionInputDto {
  abstract readonly criterion: Criterion;
}
