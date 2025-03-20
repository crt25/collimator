import { GeneralAst } from "@ast/index";
import { ClassProperties } from "../class-properties";
import { CurrentStudentAnalysisDto } from "../../generated/models";
import { fromDtos } from "../../hooks/helpers";
import { SolutionTest } from "./solution-test";
import { CurrentAnalysis } from "./current-analysis";

export class CurrentStudentAnalysis extends CurrentAnalysis {
  readonly sessionId: number;
  readonly studentId: number;
  readonly studentSolutionId: number;
  readonly studentPseudonym: string;
  readonly studentKeyPairId: number | null;

  protected constructor({
    sessionId,
    studentId,
    studentPseudonym,
    studentKeyPairId,
    studentSolutionId,
    ...rest
  }: ClassProperties<CurrentStudentAnalysis, "sourceId">) {
    super(rest);

    this.sessionId = sessionId;
    this.studentId = studentId;
    this.studentSolutionId = studentSolutionId;
    this.studentPseudonym = studentPseudonym;
    this.studentKeyPairId = studentKeyPairId;
  }

  public override get sourceId(): string {
    return `STUDENT:${this.studentId}-${this.taskId}-${this.sessionId}`;
  }

  protected override withAst(ast: GeneralAst): CurrentStudentAnalysis {
    return new CurrentStudentAnalysis({ ...this, generalAst: ast });
  }

  static fromDto(dto: CurrentStudentAnalysisDto): CurrentStudentAnalysis {
    return new CurrentStudentAnalysis({
      ...dto,
      generalAst: JSON.parse(dto.genericAst),
      tests: fromDtos(SolutionTest, dto.tests),
    });
  }
}
