import { ApiProperty } from "@nestjs/swagger";
import { AuthenticationProvider, UserType } from "@prisma/client";
import { IsNotEmpty, IsString, IsEnum, IsEmail } from "class-validator";
import { Expose } from "class-transformer";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: "John Doe",
    description: "The user's full name (optional).",
    nullable: true,
    type: "string",
  })
  @Expose()
  readonly name!: string | null;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: "john@doe.com",
    description: "The email address of a user.",
  })
  @Expose()
  readonly email!: string;

  @IsEnum(AuthenticationProvider)
  @IsNotEmpty()
  @ApiProperty({
    example: AuthenticationProvider.MICROSOFT,
    description: "The authentication provider used to sign in.",
    enumName: "AuthenticationProvider",
    enum: Object.keys(AuthenticationProvider),
  })
  @Expose()
  readonly authenticationProvider!: AuthenticationProvider;

  @IsEnum(UserType)
  @IsNotEmpty()
  @ApiProperty({
    example: UserType.TEACHER,
    description: `The user's role.`,
    enumName: "UserType",
    enum: Object.keys(UserType),
  })
  @Expose()
  readonly type!: UserType;
}
