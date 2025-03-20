import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToInstance, Transform } from "class-transformer";
import {
  CurrentStudentAnalysis,
  ReferenceAnalysis,
} from "../solutions.service";
import { CurrentStudentAnalysisDto } from "./current-student-analysis.dto";
import { ReferenceAnalysisDto } from "./reference-analysis.dto";

export class CurrentAnalysesDto {
  @ApiProperty({
    name: "studentAnalyses",
    description: "The student analyses.",
    type: [CurrentStudentAnalysisDto],
  })
  @Transform(
    ({ value }: { value: CurrentStudentAnalysis[] }) =>
      value?.map((analysis) =>
        plainToInstance(CurrentStudentAnalysisDto, analysis, {
          excludeExtraneousValues: true,
        }),
      ) ?? [],
    { toClassOnly: true },
  )
  @Expose()
  readonly studentAnalyses!: CurrentStudentAnalysisDto[];

  @ApiProperty({
    name: "referenceAnalyses",
    description: "The reference analyses.",
    type: [ReferenceAnalysisDto],
  })
  @Transform(
    ({ value }: { value: ReferenceAnalysis[] }) =>
      value?.map((analysis) =>
        plainToInstance(ReferenceAnalysisDto, analysis, {
          excludeExtraneousValues: true,
        }),
      ) ?? [],
    { toClassOnly: true },
  )
  @Expose()
  readonly referenceAnalyses!: ReferenceAnalysisDto[];
}
