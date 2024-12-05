import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToInstance, Transform, Type } from "class-transformer";
import { PrivateKeyDto } from "./private-key.dto";
import { UserIdentityWithKeyAndToken } from "../authentication.service";
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from "class-validator";
import { PublicKeyDto } from "./public-key.dto";

type KeyPair = Exclude<UserIdentityWithKeyAndToken["keyPair"], null>;

export class KeyPairDto extends PublicKeyDto {
  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
    maxDecimalPlaces: 0,
  })
  @IsNotEmpty()
  @ApiProperty({
    example: 318,
    description: "The key pair unique identifier, a positive integer.",
  })
  @Expose()
  readonly id!: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: `{"jwk": [{"alg":"EC","crv":"P-256","x":"MKBCTNIcKUSDii11ySs3526iDZ8AiTo7Tu6KPAqv7D4","y":"4Etl6SRW2YiLUrN5vfvVHuhp7x8PxltmWWlbbM4IFyM","use":"enc","kid":"1"}]}`,
    description: "The public key as a JSON Web Key (JWK)",
  })
  @Expose()
  publicKeyFingerprint!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: `dGhpcyBpcyBhbiBleGFtcGxlIHZhbHVl`,
    description: "Salt to derive a symmetric key encoded in base64.",
  })
  @Transform(
    ({ value }: { value: KeyPair["salt"] }) => value.toString("base64"),
    { toClassOnly: true },
  )
  @Expose()
  salt!: string;

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
}
