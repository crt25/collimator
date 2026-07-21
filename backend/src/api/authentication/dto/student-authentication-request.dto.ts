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

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description:
      "A deterministic, teacher-keyed identifier for the student encoded in Base64url. Used to deduplicate the student across joins without revealing their identity to the server.",
  })
  @Expose()
  readonly studentIdentifier!: string;

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
