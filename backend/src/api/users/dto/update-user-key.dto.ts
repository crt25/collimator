import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { ValidateNested } from "class-validator";
import { CreateKeyPairDto } from "./create-key-pair.dto";

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
