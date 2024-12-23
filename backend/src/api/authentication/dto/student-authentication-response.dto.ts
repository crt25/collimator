import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToInstance } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";

export class StudentAuthenticationResponseDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: "347fgdhccv9a45130fefwku1385rtsdko6t7wec102r4gw2",
    description: "The id of a student in a class.",
  })
  @Expose()
  readonly authenticationToken!: string;

  static fromQueryResult(
    data: StudentAuthenticationResponseDto,
  ): StudentAuthenticationResponseDto {
    return plainToInstance(StudentAuthenticationResponseDto, data, {
      excludeExtraneousValues: true,
    });
  }
}
