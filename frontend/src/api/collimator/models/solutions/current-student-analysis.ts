import { GeneralAst } from "@ast/index";
import { ClassProperties } from "../class-properties";
import { CurrentStudentAnalysisDto } from "../../generated/models";
import { fromDtos } from "../../hooks/helpers";
import { ExistingSolutionTest } from "./existing-solution-test";
import { CurrentAnalysis } from "./current-analysis";

export class CurrentStudentAnalysis extends CurrentAnalysis {
  readonly sessionId: number;
  readonly studentId: number;
  // null when the latest solution came from tracking student activities since it has no link to StudentSolution, so no studentSolutionId is available
  readonly studentSolutionId: number | null;
  // true when backed by a StudentSolution row; false for activity-tracked analyses
  readonly isStudentSolution: boolean;
  readonly studentPseudonym: string | null;
  readonly studentKeyPairId: number | null;
  readonly isLatest: boolean;

  protected constructor({
    sessionId,
    studentId,
    studentPseudonym,
    studentKeyPairId,
    studentSolutionId,
    isStudentSolution,
    isLatest,
    ...rest
  }: Omit<ClassProperties<CurrentStudentAnalysis>, "solutionId">) {
    super(rest);

    this.sessionId = sessionId;
    this.studentId = studentId;
    this.studentSolutionId = studentSolutionId;
    this.isStudentSolution = isStudentSolution;
    this.studentPseudonym = studentPseudonym;
    this.studentKeyPairId = studentKeyPairId;
    this.isLatest = isLatest;
  }

  public override get solutionId(): string {
    return `STUDENT:${this.studentSolutionId ?? this.solutionHash}`;
  }

  protected override withAst(ast: GeneralAst): CurrentStudentAnalysis {
    return new CurrentStudentAnalysis({ ...this, generalAst: ast });
  }

  public withIsReference(isReferenceSolution: boolean): CurrentStudentAnalysis {
    return new CurrentStudentAnalysis({
      ...this,
      isReferenceSolution,
    });
  }

  static fromDto(dto: CurrentStudentAnalysisDto): CurrentStudentAnalysis {
    return new CurrentStudentAnalysis({
      ...dto,
      generalAst: JSON.parse(dto.genericAst),
      tests: fromDtos(ExistingSolutionTest, dto.tests),
    });
  }

  static findAnalysisToDisplay(
    analyses: CurrentAnalysis[],
    studentId: number,
  ): CurrentStudentAnalysis | null {
    return (
      analyses.find(
        (a): a is CurrentStudentAnalysis =>
          // the analysis is for this student and is the latest version
          a instanceof CurrentStudentAnalysis &&
          a.studentId === studentId &&
          a.isLatest,
      ) ?? null
    );
  }
}
