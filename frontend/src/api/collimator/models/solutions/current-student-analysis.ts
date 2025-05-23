import { GeneralAst } from "@ast/index";
import { ClassProperties } from "../class-properties";
import { CurrentStudentAnalysisDto } from "../../generated/models";
import { fromDtos } from "../../hooks/helpers";
import { ExistingSolutionTest } from "./existing-solution-test";
import { CurrentAnalysis } from "./current-analysis";

export class CurrentStudentAnalysis extends CurrentAnalysis {
  readonly sessionId: number;
  readonly studentId: number;
  readonly studentSolutionId: number;
  readonly studentPseudonym: string | null;
  readonly studentKeyPairId: number | null;

  protected constructor({
    sessionId,
    studentId,
    studentPseudonym,
    studentKeyPairId,
    studentSolutionId,
    ...rest
  }: Omit<ClassProperties<CurrentStudentAnalysis>, "solutionId">) {
    super(rest);

    this.sessionId = sessionId;
    this.studentId = studentId;
    this.studentSolutionId = studentSolutionId;
    this.studentPseudonym = studentPseudonym;
    this.studentKeyPairId = studentKeyPairId;
  }

  public override get solutionId(): string {
    return `STUDENT:${this.studentSolutionId}`;
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
}
