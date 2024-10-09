import { Assignment } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class AssignmentEntity implements Assignment {
  @ApiProperty()
  readonly id: number;

  @ApiProperty()
  readonly title: string;

  constructor(assignment: Assignment) {
    this.id = assignment.id;
    this.title = assignment.title;
  }
}
