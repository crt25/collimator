import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { CreatePrivateKeyDto } from "./create-private-key.dto";
import { IsNotEmpty, IsString, ValidateNested } from "class-validator";

export class CreateKeyPairDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: `{"jwk": [{"alg":"EC","crv":"P-256","x":"MKBCTNIcKUSDii11ySs3526iDZ8AiTo7Tu6KPAqv7D4","y":"4Etl6SRW2YiLUrN5vfvVHuhp7x8PxltmWWlbbM4IFyM","use":"enc","kid":"1"}]}`,
    description: "The public key as a JSON Web Key (JWK)",
  })
  @Expose()
  publicKey!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: "dGhpcyBpcyBhbiBleGFtcGxlIHZhbHVl",
    description: "The url-safe base64 encoded fingerprint of the public key.",
  })
  @Expose()
  publicKeyFingerprint!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: `dGhpcyBpcyBhbiBleGFtcGxlIHZhbHVl`,
    description: "Salt to derive a symmetric key encoded in base64.",
  })
  @Expose()
  salt!: string;

  @ValidateNested({ each: true })
  @ApiProperty({
    description:
      "The encrypted private keys belonging to this public key. Each of these private keys is the same but encrypted with a different symmetric key.",
    type: CreatePrivateKeyDto,
    isArray: true,
  })
  @Type(() => CreatePrivateKeyDto)
  @Expose()
  privateKeys!: CreatePrivateKeyDto[];
}
