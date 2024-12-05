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
  readonly studentKeyPairId: number | null;

  protected constructor({
    id,
    solutionId,
    generalAst,
    totalTests,
    passedTests,
    studentPseudonym,
    studentKeyPairId,
  }: ClassProperties<CurrentAnalysis>) {
    this.id = id;
    this.solutionId = solutionId;
    this.generalAst = generalAst;
    this.totalTests = totalTests;
    this.passedTests = passedTests;
    this.studentPseudonym = studentPseudonym;
    this.studentKeyPairId = studentKeyPairId;
  }

  static fromDto(dto: CurrentAnalysisDto): CurrentAnalysis {
    return new CurrentAnalysis({
      ...dto,
      generalAst: JSON.parse(dto.genericAst),
    });
  }
}
