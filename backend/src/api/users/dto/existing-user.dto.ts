import { ApiProperty } from "@nestjs/swagger";
import { User } from "@prisma/client";
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { Expose, plainToInstance } from "class-transformer";
import { CreateUserDto } from "./create-user.dto";

export type UserId = number;

export class ExistingUserDto extends CreateUserDto implements User {
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
  readonly id!: UserId;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: "sfdhkj48732h3bj32hjk332424",
    description:
      "An identifier for the user which is unique for the authentication provider.",
    type: "string",
    nullable: true,
  })
  @Expose()
  readonly oidcSub!: string | null;

  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
    maxDecimalPlaces: 0,
  })
  @IsNotEmpty()
  @ApiProperty({
    example: 318,
    description: "The unique identifier of the associated public key.",
    nullable: true,
  })
  @Expose()
  publicKeyId!: number | null;

  @IsDate()
  @ApiProperty({ nullable: true })
  @Expose()
  readonly deletedAt!: Date | null;

  static fromQueryResult(data: User): ExistingUserDto {
    return plainToInstance(ExistingUserDto, data, {
      excludeExtraneousValues: true,
    });
  }
}
