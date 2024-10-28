import { ApiProperty } from "@nestjs/swagger";
import { Task, TaskType } from "@prisma/client";

export type TaskWithoutData = Omit<Task, "rawData">;

export class TaskInfoEntity implements TaskWithoutData {
  @ApiProperty()
  readonly id: number;

  @ApiProperty()
  readonly title: string;

  @ApiProperty()
  readonly description: string;

  @ApiProperty()
  readonly type: TaskType;

  constructor(entity: TaskWithoutData) {
    this.id = entity.id;
    this.title = entity.title;
    this.description = entity.description;
    this.type = entity.type;
  }
}
