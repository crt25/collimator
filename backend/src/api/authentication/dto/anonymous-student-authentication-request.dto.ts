import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNumber } from "class-validator";

export class AnonymousStudentAuthenticationRequestDto {
  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
    maxDecimalPlaces: 0,
  })
  @ApiProperty({
    example: 381,
    description:
      "The unique identifier of the class the student is signing in to.",
  })
  @Expose()
  readonly classId!: number;

  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
    maxDecimalPlaces: 0,
  })
  @ApiProperty({
    example: 381,
    description:
      "The unique identifier of the session the student is signing in to.",
  })
  @Expose()
  readonly sessionId!: number;
}
