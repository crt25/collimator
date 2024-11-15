import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class StudentAuthenticationRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description:
      "The teacher-assigned pseudonym for the student. This is a the student's real identity but encrypted and encoded in Base64.",
  })
  @Expose()
  readonly pseudonym!: string;

  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
    maxDecimalPlaces: 0,
  })
  @ApiProperty({
    example: 381,
    description: "The unique identifier of the class the student is in.",
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
      "The unique identifier of the key pair used to encrypt the pseudonym.",
  })
  @Expose()
  readonly keyPairId!: number;
}
