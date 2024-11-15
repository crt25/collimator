import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToInstance, Transform, Type } from "class-transformer";
import {
  PublicKey,
  UserIdentityWithKeyAndToken,
} from "../authentication.service";
import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";

type KeyPair = Exclude<UserIdentityWithKeyAndToken["keyPair"], null>;

export class PublicKeyDto {
  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
    maxDecimalPlaces: 0,
  })
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    description: "The id of the key pair.",
  })
  id!: number;

  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
    maxDecimalPlaces: 0,
  })
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    description: "The id of the teacher this key belongs to.",
  })
  @Expose()
  teacherId!: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: `{"jwk": [{"alg":"EC","crv":"P-256","x":"MKBCTNIcKUSDii11ySs3526iDZ8AiTo7Tu6KPAqv7D4","y":"4Etl6SRW2YiLUrN5vfvVHuhp7x8PxltmWWlbbM4IFyM","use":"enc","kid":"1"}]}`,
    description: "The public key as a JSON Web Key (JWK)",
  })
  @Transform(
    ({ value }: { value: KeyPair["publicKey"] }) => value.toString("utf-8"),
    { toClassOnly: true },
  )
  @Expose()
  publicKey!: string;

  @IsDate()
  @ApiProperty()
  @Expose()
  @Type(() => Date)
  readonly createdAt!: Date;

  static fromQueryResult(data: PublicKey): PublicKeyDto {
    return plainToInstance(PublicKeyDto, data, {
      excludeExtraneousValues: true,
    });
  }
}
