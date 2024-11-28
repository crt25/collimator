import { GeneralAst } from "@ast/index";
import { CurrentAnalysisDto } from "../../generated/models";
import { ClassProperties } from "../class-properties";

export class CurrentAnalysis {
  readonly id: number;
  readonly solutionId: number;
  readonly generalAst: GeneralAst;

  readonly totalTests: number;
  readonly passedTests: number;

  readonly studentPseudonym: string;

  protected constructor({
    id,
    solutionId,
    generalAst,
    totalTests,
    passedTests,
    studentPseudonym,
  }: ClassProperties<CurrentAnalysis>) {
    this.id = id;
    this.solutionId = solutionId;
    this.generalAst = generalAst;
    this.totalTests = totalTests;
    this.passedTests = passedTests;
    this.studentPseudonym = studentPseudonym;
  }

  static fromDto(dto: CurrentAnalysisDto): CurrentAnalysis {
    return new CurrentAnalysis({
      ...dto,
      generalAst: JSON.parse(dto.genericAst),
    });
  }
}
