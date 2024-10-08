import { PartialType } from "@nestjs/mapped-types";
import { CreateUserDto } from "./create-user.dto";
import { Prisma } from "@prisma/client";
import { OmitType } from "@nestjs/swagger";

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ["toInput"]),
) {
  toInput(): Prisma.UserUpdateInput {
    return {
      name: this.name,
      email: this.email,
    };
  }
}
