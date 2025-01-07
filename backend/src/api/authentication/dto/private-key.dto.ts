import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";
import { UserIdentityWithKeyAndToken } from "../authentication.service";

type PrivateKey = Exclude<
  UserIdentityWithKeyAndToken["keyPair"],
  null
>["privateKeys"][0];

export class PrivateKeyDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: "dGhpcyBpcyBhbiBleGFtcGxlIHZhbHVl",
    description: "The base64 encoded public key.",
  })
  @Transform(
    ({ value }: { value: PrivateKey["encryptedPrivateKey"] }) =>
      value.toString("base64"),
    { toClassOnly: true },
  )
  @Expose()
  encryptedPrivateKey!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: "dGhpcyBpcyBhbiBleGFtcGxlIHZhbHVl",
    description:
      "The base64 encoded salt used to derive the symmetric key that encrypted the private key.",
  })
  @Transform(
    ({ value }: { value: PrivateKey["salt"] }) => value.toString("base64"),
    { toClassOnly: true },
  )
  @Expose()
  salt!: string;
}
