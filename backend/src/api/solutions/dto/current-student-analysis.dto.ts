import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToInstance, Transform } from "class-transformer";
import { Modify } from "src/utilities/modify";
import { SessionId } from "src/api/sessions/dto";
import { CurrentStudentAnalysis, StudentId } from "../solutions.service";
import { StudentSolutionId } from "./existing-student-solution.dto";
import { CurrentAnalysisDto } from "./current-analysis.dto";

export class CurrentStudentAnalysisDto
  extends CurrentAnalysisDto
  implements
    Modify<
      CurrentStudentAnalysis,
      { solutionHash: string; studentPseudonym: string }
    >
{
  @ApiProperty({
    example: 318,
    description: "The student's  unique identifier, a positive integer.",
    nullable: false,
  })
  @Expose()
  readonly studentId!: StudentId;

  @ApiProperty({
    example: 318,
    description:
      "The student solutions's unique identifier, a positive integer.",
    nullable: false,
  })
  @Expose()
  readonly studentSolutionId!: StudentSolutionId;

  @ApiProperty({
    example: "John Doe",
    description: "The pseudonym of the student",
    type: "string",
  })
  @Transform(
    ({ obj: { studentPseudonym } }: { obj: CurrentStudentAnalysis }) =>
      studentPseudonym
        ? Buffer.from(studentPseudonym).toString("base64")
        : null,
    {
      toClassOnly: true,
    },
  )
  @Expose()
  readonly studentPseudonym!: string;

  @ApiProperty({
    example: 1,
    description:
      "The unique identifier of the key pair used to encrypt the student's pseudonym.",
    nullable: true,
    type: "number",
  })
  @Expose()
  readonly studentKeyPairId!: number | null;

  @ApiProperty({
    example: 318,
    description: "The sessions's unique identifier, a positive integer.",
    nullable: false,
  })
  @Expose()
  readonly sessionId!: SessionId;

  static fromQueryResult(
    data: CurrentStudentAnalysis,
  ): CurrentStudentAnalysisDto {
    return plainToInstance(CurrentStudentAnalysisDto, data, {
      excludeExtraneousValues: true,
    });
  }
}
