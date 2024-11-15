import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToInstance, Transform, Type } from "class-transformer";
import { PrivateKeyDto } from "./private-key.dto";
import { UserIdentityWithKeyAndToken } from "../authentication.service";
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from "class-validator";

type KeyPair = Exclude<UserIdentityWithKeyAndToken["keyPair"], null>;

export class KeyPairDto {
  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
    maxDecimalPlaces: 0,
  })
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    description: "The id of the public key.",
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

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: `{"jwk": [{"alg":"EC","crv":"P-256","x":"MKBCTNIcKUSDii11ySs3526iDZ8AiTo7Tu6KPAqv7D4","y":"4Etl6SRW2YiLUrN5vfvVHuhp7x8PxltmWWlbbM4IFyM","use":"enc","kid":"1"}]}`,
    description: "The public key as a JSON Web Key (JWK)",
  })
  @Expose()
  publicKeyFingerprint!: string;

  @ValidateNested({ each: true })
  @ApiProperty({
    description:
      "The encrypted private keys belonging to this public key. Each of these private keys is the same but encrypted with a different symmetric key.",
    type: PrivateKeyDto,
    isArray: true,
  })
  @Type(() => PrivateKeyDto)
  @Transform(
    ({ obj }: { obj: KeyPair }) =>
      obj.privateKeys.map((keys) =>
        plainToInstance(PrivateKeyDto, keys, {
          excludeExtraneousValues: true,
        }),
      ),
    { toClassOnly: true },
  )
  @Expose()
  privateKeys!: PrivateKeyDto[];

  @IsDate()
  @ApiProperty()
  @Expose()
  @Type(() => Date)
  readonly createdAt!: Date;

  static fromQueryResult(
    data: UserIdentityWithKeyAndToken["keyPair"],
  ): KeyPairDto | null {
    if (data === null) {
      return null;
    }

    return plainToInstance(KeyPairDto, data, {
      excludeExtraneousValues: true,
    });
  }
}
