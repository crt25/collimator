import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToInstance } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, IsNumber } from "class-validator";

export class StudentAuthenticationResponseDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: "347fgdhccv9a45130fefwku1385rtsdko6t7wec102r4gw2",
    description: "The id of a student in a class.",
  })
  @Expose()
  readonly authenticationToken!: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 123,
    description: "The id of the student.",
  })
  @Expose()
  readonly studentId!: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    required: false,
    description:
      "The deterministic, teacher-keyed identifier stored for the student, encoded in Base64url. Absent for students created before this identifier existed.",
  })
  @Expose()
  readonly studentIdentifier?: string;

  static fromQueryResult(
    data: StudentAuthenticationResponseDto,
  ): StudentAuthenticationResponseDto {
    return plainToInstance(StudentAuthenticationResponseDto, data, {
      excludeExtraneousValues: true,
    });
  }
}
