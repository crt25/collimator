import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreatePrivateKeyDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: "dGhpcyBpcyBhbiBleGFtcGxlIHZhbHVl",
    description: "The base64 encoded public key.",
  })
  encryptedPrivateKey!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: "dGhpcyBpcyBhbiBleGFtcGxlIHZhbHVl",
    description:
      "The base64 encoded salt used to derive the symmetric key that encrypted the private key.",
  })
  salt!: string;
}
