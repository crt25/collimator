import { GeneralAst } from "@ast/index";
import { CurrentAnalysisDto } from "../../generated/models";
import { ClassProperties } from "../class-properties";

export class CurrentAnalysis {
  readonly id: number;
  readonly solutionId: number;
  readonly generalAst: GeneralAst;
  readonly studentPseudonym: string;

  protected constructor({
    id,
    solutionId,
    generalAst,
    studentPseudonym,
  }: ClassProperties<CurrentAnalysis>) {
    this.id = id;
    this.solutionId = solutionId;
    this.generalAst = generalAst;
    this.studentPseudonym = studentPseudonym;
  }

  static fromDto(dto: CurrentAnalysisDto): CurrentAnalysis {
    return new CurrentAnalysis({
      id: dto.id,
      solutionId: dto.solutionId,
      generalAst: JSON.parse(dto.genericAst),
      studentPseudonym: dto.studentPseudonym,
    });
  }
}
