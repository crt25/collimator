import { ApiProperty } from "@nestjs/swagger";
import { Prisma } from "@prisma/client";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateAssignmentDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly title!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly description!: string;

  toInput(): Prisma.AssignmentCreateInput {
    return {
      title: this.title,
      description: this.description,
    };
  }
}
