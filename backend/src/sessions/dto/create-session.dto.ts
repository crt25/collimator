import { ApiProperty } from "@nestjs/swagger";
import { Prisma } from "@prisma/client";
import {
  IsNotEmpty,
  IsString,
  IsArray,
  ArrayMinSize,
  IsInt,
} from "class-validator";

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly name!: string;

  @IsArray()
  @IsInt({ each: true })
  @ArrayMinSize(1)
  @IsNotEmpty()
  @ApiProperty()
  readonly tasks!: number[];

  @IsInt()
  @IsNotEmpty()
  @ApiProperty()
  readonly teacherId!: number;

  toInput(): Prisma.SessionCreateInput {
    const taskIds = this.tasks.map((a) => {
      return { taskId: a };
    });

    return {
      name: this.name,
      teacher: {
        connect: {
          id: this.teacherId,
        },
      },
      tasks: {
        createMany: {
          data: taskIds,
          skipDuplicates: true,
        },
      },
    };
  }
}
