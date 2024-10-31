import { ApiProperty } from "@nestjs/swagger";
import { UserType } from "@prisma/client";
import { IsEmail, IsNotEmpty, IsString, IsEnum } from "class-validator";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: "John Doe",
    description: "The user's full name (optional).",
  })
  readonly name!: string | null;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: "john.doe@example.com",
    description: "The user's email address.",
  })
  readonly email!: string;

  @IsEnum(UserType)
  @IsNotEmpty()
  @ApiProperty({
    example: UserType.TEACHER,
    description: `The user's role, one of: ${Object.values(UserType).join(", ")}.`,
  })
  readonly type!: UserType;
}
