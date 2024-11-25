import { GeneralAst } from "@ast/index";
import { CurrentAnalysisDto } from "../../generated/models";
import { ClassProperties } from "../class-properties";

export class CurrentAnalysis {
  readonly id: number;
  readonly solutionId: number;
  readonly generalAst: GeneralAst;

  protected constructor({
    id,
    solutionId,
    generalAst,
  }: ClassProperties<CurrentAnalysis>) {
    this.id = id;
    this.solutionId = solutionId;
    this.generalAst = generalAst;
  }

  static fromDto(dto: CurrentAnalysisDto): CurrentAnalysis {
    return new CurrentAnalysis({
      id: dto.id,
      solutionId: dto.solutionId,
      generalAst: JSON.parse(dto.genericAst),
    });
  }
}
