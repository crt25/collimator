import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, plainToInstance, Transform } from "class-transformer";
import { Modify } from "src/utilities/modify";
import { SolutionWithoutData } from "../solutions.service";

export class ExistingSolutionDto
  implements Modify<SolutionWithoutData, { hash: string }>
{
  @ApiProperty({
    example: "dGhpcyBpcyBhbiBleGFtcGxlIHZhbHVl",
    description: "The base64 encoded solution hash.",
  })
  @Transform(
    ({ obj: { hash } }: { obj: SolutionWithoutData }) =>
      Buffer.from(hash).toString("base64url"),
    { toClassOnly: true },
  )
  @Expose()
  readonly hash!: string;

  @ApiProperty()
  @Expose()
  readonly taskId!: number;

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
