import { ApiProperty } from "@nestjs/swagger";
import { Prisma } from "@prisma/client";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateAssignmentDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly title!: string;

  toInput(): Prisma.AssignmentCreateInput {
    return {
      title: this.title,
    };
  }
}
