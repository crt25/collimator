import { ApiProperty } from "@nestjs/swagger";
import { Class } from "@prisma/client";
import { CreateClassDto } from "./create-class.dto";

export type ClassId = number;

export class ExistingClassDto extends CreateClassDto implements Class {
  @ApiProperty({
    example: 318,
    description: "The class unique identifier, a positive integer.",
  })
  readonly id!: ClassId;
}
