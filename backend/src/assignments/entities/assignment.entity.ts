import { ApiProperty } from "@nestjs/swagger";
import { Assignment } from "@prisma/client";

export class AssignmentEntity implements Assignment {
  @ApiProperty()
  readonly id: number;

  @ApiProperty()
  readonly title: string;

  @ApiProperty()
  readonly description: string;

  constructor(entity: Assignment) {
    this.id = entity.id;
    this.title = entity.title;
    this.description = entity.description;
  }
}
