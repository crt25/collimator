import { ApiProperty } from "@nestjs/swagger";
import { Task, TaskType } from "@prisma/client";

export class TaskEntity implements Task {
  @ApiProperty()
  readonly id: number;

  @ApiProperty()
  readonly title: string;

  @ApiProperty()
  readonly description: string;

  @ApiProperty()
  readonly type: TaskType;

  @ApiProperty()
  readonly rawData: Buffer;

  constructor(entity: Task) {
    this.id = entity.id;
    this.title = entity.title;
    this.description = entity.description;
    this.type = entity.type;
    this.rawData = entity.rawData;
  }
}
