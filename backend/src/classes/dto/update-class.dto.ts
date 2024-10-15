import { PartialType } from "@nestjs/mapped-types";
import { OmitType } from "@nestjs/swagger";
import { Prisma } from "@prisma/client";
import { CreateClassDto } from "src/classes/dto/create-class.dto";

export class UpdateClassDto extends PartialType(
  OmitType(CreateClassDto, ["assignments", "toInput"]),
) {
  toInput(): Prisma.ClassUpdateInput {
    return {
      name: this.name,
      teacher: {
        connect: {
          id: this.teacherId,
        },
      },
    };
  }
}
