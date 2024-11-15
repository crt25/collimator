import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToInstance, Type } from "class-transformer";
import { UserIdentityWithKeyAndToken } from "../authentication.service";
import { UserType } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsNumber } from "class-validator";
import { KeyPairDto } from "./key-pair.dto";

export class AuthenticationResponseDto {
  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
    maxDecimalPlaces: 0,
  })
  @IsNotEmpty()
  @ApiProperty({
    example: 318,
    description: "The user unique identifier, a positive integer.",
  })
  @Expose()
  readonly id!: number;

  @ApiProperty({
    example: "John",
    description: "The name of the authenticated user.",
    nullable: true,
    type: "string",
  })
  @Expose()
  name!: string | null;

  @ApiProperty({
    example: "jane@doe.com",
    description: "The email of the authenticated user.",
  })
  @Expose()
  email!: string;

  @IsEnum(UserType)
  @IsNotEmpty()
  @ApiProperty({
    example: UserType.TEACHER,
    description: `The user's role.`,
    enumName: "UserType",
    enum: Object.keys(UserType),
  })
  @Expose()
  type!: UserType;

  @ApiProperty({
    description: "A teachers's base64 encoded public key.",
    nullable: true,
    type: KeyPairDto,
  })
  @Type(() => KeyPairDto)
  @Expose()
  keyPair!: KeyPairDto | null;

  @ApiProperty({
    example: "347fgdhccv9a45130fefwku1385rtsdko6t7wec102r4gw2",
    description: "The id of a student in a class.",
  })
  @Expose()
  readonly authenticationToken!: string;

  static fromQueryResult(
    data: UserIdentityWithKeyAndToken,
  ): AuthenticationResponseDto {
    return plainToInstance(AuthenticationResponseDto, data, {
      excludeExtraneousValues: true,
    });
  }
}
