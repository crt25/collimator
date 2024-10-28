import { ApiProperty } from "@nestjs/swagger";
import { Prisma, TaskType } from "@prisma/client";
import { IsBase64, IsEnum, IsNotEmpty, IsString } from "class-validator";

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly title!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly description!: string;

  @IsEnum(TaskType)
  @IsNotEmpty()
  @ApiProperty()
  readonly type!: TaskType;

  @IsBase64()
  @IsNotEmpty()
  @ApiProperty()
  readonly rawData!: string;

  toInput(): Prisma.TaskCreateInput {
    return {
      title: this.title,
      description: this.description,
      type: this.type,
      rawData: Buffer.from(this.rawData, "base64"),
    };
  }
}
