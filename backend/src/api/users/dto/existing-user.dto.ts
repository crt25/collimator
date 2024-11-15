import { ApiProperty } from "@nestjs/swagger";
import { User } from "@prisma/client";
import { CreateUserDto } from "./create-user.dto";
import { IsNotEmpty, IsNumber } from "class-validator";
import { Expose, plainToInstance } from "class-transformer";

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

  static fromQueryResult(data: User): ExistingUserDto {
    return plainToInstance(ExistingUserDto, data, {
      excludeExtraneousValues: true,
    });
  }
}
