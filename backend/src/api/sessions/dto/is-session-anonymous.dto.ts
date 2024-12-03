import { ApiProperty } from "@nestjs/swagger";
import { Session } from "@prisma/client";
import { Expose, plainToInstance } from "class-transformer";

export class IsSessionAnonymousDto {
  @ApiProperty({
    example: 1,
    description: "The id of a lesson.",
  })
  @Expose()
  readonly id!: number;

  @ApiProperty({
    example: "true",
    description: "Whether the session is anonymous.",
    type: "boolean",
  })
  @Expose()
  readonly isAnonymous!: boolean;

  static fromQueryResult(data: Session): IsSessionAnonymousDto {
    return plainToInstance(IsSessionAnonymousDto, data, {
      excludeExtraneousValues: true,
    });
  }
}
