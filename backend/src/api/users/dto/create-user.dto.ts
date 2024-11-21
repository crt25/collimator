import { ApiProperty } from "@nestjs/swagger";
import { AuthenticationProvider, UserType } from "@prisma/client";
import { IsNotEmpty, IsString, IsEnum } from "class-validator";
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
  @IsNotEmpty()
  @ApiProperty({
    example: "sfdhkj48732h3bj32hjk332424",
    description:
      "An identifier for the user which is unique for the authentication provider.",
  })
  @Expose()
  readonly oidcSub!: string;

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
