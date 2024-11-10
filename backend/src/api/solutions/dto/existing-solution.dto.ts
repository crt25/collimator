import { ApiProperty } from "@nestjs/swagger";
import { Solution } from "@prisma/client";
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
  readonly studentId!: string;

  @ApiProperty()
  @Expose()
  readonly sessionId!: number;

  @ApiProperty()
  @Expose()
  readonly taskId!: number;

  @Exclude()
  readonly mimeType!: string;

  static fromQueryResult(data: SolutionWithoutData): ExistingSolutionDto {
    return plainToInstance(ExistingSolutionDto, data, {
      excludeExtraneousValues: true,
    });
  }
}
