import { PartialType } from "@nestjs/mapped-types";
import { OmitType } from "@nestjs/swagger";
import { Prisma } from "@prisma/client";
import { CreateAssignmentDto } from "./create-assignment.dto";

export class UpdateAssignmentDto extends PartialType(
  OmitType(CreateAssignmentDto, ["toInput"]),
) {
  toInput(): Prisma.AssignmentUpdateInput {
    return {
      title: this.title,
    };
  }
}
