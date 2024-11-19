import { Injectable } from "@nestjs/common";
import { GeneralAst } from "src/ast/types/general-ast";
import CriteriaBasedAnalysisWorker, {
  AnalysisInput,
  AnalysisOutput,
} from "./criteria-based-analysis-worker.piscina";
import { Piscina } from "piscina";
import { resolve } from "path";

type AnalysisWorker = typeof CriteriaBasedAnalysisWorker;

@Injectable()
export class CriteriaBasedAnalyzerService {
  private criteriaAnalysisWorker = new Piscina<
    Parameters<AnalysisWorker>[0],
    ReturnType<AnalysisWorker>
  >({
    filename: resolve(
      __dirname,
      // use the .js extension because NestJS compiles the typescript files
      "./criteria-based-analysis-worker.piscina.js",
    ),
  });

  analyze(
    asts: GeneralAst[],
    input: AnalysisInput[],
  ): Promise<AnalysisOutput[][]> {
    return this.criteriaAnalysisWorker.run({
      asts,
      input,
    });
  }
}
