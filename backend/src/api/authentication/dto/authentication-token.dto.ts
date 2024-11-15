import { ApiProperty } from "@nestjs/swagger";
import { AuthenticationToken } from "@prisma/client";
import { Expose, plainToInstance } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";

export class AuthenticationTokenDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
    description: "An authentication token.",
  })
  @Expose()
  readonly token!: string;

  static fromQueryResult(data: AuthenticationToken): AuthenticationTokenDto {
    return plainToInstance(AuthenticationTokenDto, data, {
      excludeExtraneousValues: true,
    });
  }
}
