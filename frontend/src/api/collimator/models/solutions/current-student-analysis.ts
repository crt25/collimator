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

  protected constructor({
    sessionId,
    studentId,
    studentPseudonym,
    studentKeyPairId,
    studentSolutionId,
    isStudentSolution,
    ...rest
  }: Omit<ClassProperties<CurrentStudentAnalysis>, "solutionId">) {
    super(rest);

    this.sessionId = sessionId;
    this.studentId = studentId;
    this.studentSolutionId = studentSolutionId;
    this.isStudentSolution = isStudentSolution;
    this.studentPseudonym = studentPseudonym;
    this.studentKeyPairId = studentKeyPairId;
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

  /**
   * Returns the most relevant analysis for a student for the progress list and
   * student-result page: the current (non-starred) work so the teacher can see
   * whether the latest submission is already in the showcase and act on it.
   * Falls back to the starred analysis only when no unstarred entry exists
   */
  static findAnalysisToDisplay(
    analyses: CurrentAnalysis[],
    studentId: number,
  ): CurrentStudentAnalysis | null {
    const studentAnalyses = analyses.filter(
      (a): a is CurrentStudentAnalysis =>
        a instanceof CurrentStudentAnalysis && a.studentId === studentId,
    );

    const current = studentAnalyses.find((a) => !a.isReferenceSolution);
    const starred = studentAnalyses.find((a) => a.isReferenceSolution);

    return current ?? starred ?? null;
  }
}
