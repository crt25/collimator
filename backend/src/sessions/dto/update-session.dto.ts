import { PartialType } from "@nestjs/mapped-types";
import { OmitType } from "@nestjs/swagger";
import { Prisma } from "@prisma/client";
import { CreateSessionDto } from "src/sessions/dto/create-session.dto";

export class UpdateSessionDto extends PartialType(
  OmitType(CreateSessionDto, ["toInput"]),
) {
  toInput(): Prisma.SessionUpdateInput {
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
