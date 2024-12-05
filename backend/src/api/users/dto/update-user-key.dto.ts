import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { CreateKeyPairDto } from "./create-key-pair.dto";
import { ValidateNested } from "class-validator";

export class UpdateUserKeyDto {
  @ValidateNested()
  @ApiProperty({
    description: "The public key associated with this user.",
    type: CreateKeyPairDto,
  })
  @Type(() => CreateKeyPairDto)
  @Expose()
  key!: CreateKeyPairDto;
}
