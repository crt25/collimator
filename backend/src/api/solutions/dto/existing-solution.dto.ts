import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, plainToInstance, Type } from "class-transformer";
import { SolutionWithoutData } from "../solutions.service";

export type SolutionId = number;

export class ExistingSolutionDto implements SolutionWithoutData {
  @ApiProperty({
    example: 318,
    description: "The solution's unique identifier, a positive integer.",
  })
  @Expose()
  readonly id!: SolutionId;

  @ApiProperty()
  @Expose()
  @Type(() => Date)
  readonly createdAt!: Date;

  @ApiProperty()
  @Expose()
  readonly studentId!: number;

  @ApiProperty()
  @Expose()
  readonly sessionId!: number;

  @ApiProperty()
  @Expose()
  readonly taskId!: number;

  @ApiProperty({
    example: 12,
    description: "The total number of tests.",
  })
  @Expose()
  readonly totalTests!: number;

  @ApiProperty({
    example: 10,
    description: "The number of passed tests.",
  })
  @Expose()
  readonly passedTests!: number;

  @Exclude()
  readonly mimeType!: string;

  @Exclude()
  readonly failedAnalyses!: number;

  static fromQueryResult(data: SolutionWithoutData): ExistingSolutionDto {
    return plainToInstance(ExistingSolutionDto, data, {
      excludeExtraneousValues: true,
    });
  }
}
