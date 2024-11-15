import { ApiProperty } from "@nestjs/swagger";
import { CreateUserDto } from "./create-user.dto";
import { Expose, Type } from "class-transformer";
import { CreateKeyPairDto } from "./create-key-pair.dto";
import { ValidateNested } from "class-validator";

export class UpdateUserDto extends CreateUserDto {
  @ValidateNested()
  @ApiProperty({
    description: "The public key associated with this user.",
    type: CreateKeyPairDto,
    nullable: true,
  })
  @Type(() => CreateKeyPairDto)
  @Expose()
  key!: CreateKeyPairDto | null;
}
