import { ApiProperty } from "@nestjs/swagger";
import { Prisma } from "@prisma/client";
import { IsNotEmpty, IsString, IsInt } from "class-validator";

export class CreateClassDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly name!: string;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty()
  readonly teacherId!: number;

  toInput(): Prisma.ClassCreateInput {
    return {
      name: this.name,
      teacher: {
        connect: {
          id: this.teacherId,
        },
      },
    };
  }
}
