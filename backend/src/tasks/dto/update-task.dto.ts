import { PartialType } from "@nestjs/mapped-types";
import { OmitType } from "@nestjs/swagger";
import { Prisma } from "@prisma/client";
import { CreateTaskDto } from "./create-task.dto";

export class UpdateTaskDto extends PartialType(
  OmitType(CreateTaskDto, ["toInput"]),
) {
  toInput(): Prisma.TaskUpdateInput {
    return {
      title: this.title ? this.title : "",
      description: this.description ? this.description : "",
      type: this.type ? this.type : undefined,
      rawData: this.rawData ? Buffer.from(this.rawData, "base64") : undefined,
    };
  }
}
