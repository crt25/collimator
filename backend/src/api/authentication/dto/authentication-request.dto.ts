import { ApiProperty } from "@nestjs/swagger";
import { AuthenticationProvider } from "@prisma/client";
import { Expose } from "class-transformer";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class AuthenticationRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
    description:
      "The OpenIdConnect id token (JWT token). https://jwt.io may be helpful.",
  })
  @Expose()
  readonly idToken!: string;

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

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
    description:
      "An optional registration token, necessary the first time a user signs in.",
    type: "string",
    nullable: true,
  })
  @Expose()
  readonly registrationToken!: string | null;
}
