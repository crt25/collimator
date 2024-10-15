import { ApiProperty } from "@nestjs/swagger";
import { Prisma } from "@prisma/client";
import {
  IsNotEmpty,
  IsString,
  IsArray,
  ArrayMinSize,
  IsInt,
} from "class-validator";

export class CreateClassDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly name!: string;

  @IsArray()
  @IsInt({ each: true })
  @ArrayMinSize(1)
  @IsNotEmpty()
  @ApiProperty()
  readonly assignments!: number[];

  @IsInt()
  @IsNotEmpty()
  @ApiProperty()
  readonly teacherId!: number;

  toInput(): Prisma.ClassCreateInput {
    const assignmentIds = this.assignments.map((a) => {
      return { assignmentId: a };
    });

    return {
      name: this.name,
      teacher: {
        connect: {
          id: this.teacherId,
        },
      },
      assignments: {
        createMany: {
          data: assignmentIds,
          skipDuplicates: true,
        },
      },
    };
  }
}
