import { ExistingClassDto } from "./existing-class.dto";
import { ApiProperty } from "@nestjs/swagger";
import { Exclude } from "class-transformer";
import { IsString } from "class-validator";

class ClassTeacherDto {
  @ApiProperty({
    example: 1,
    description: "The id of a class's teacher.",
  })
  readonly id!: number;

  @IsString()
  @ApiProperty({
    example: "John Doe",
    description: "The name of the class's teacher.",
    nullable: true,
    type: "string",
  })
  readonly name!: string | null;
}

export class ExistingClassWithTeacherDto extends ExistingClassDto {
  @ApiProperty({
    description: "The teacher of the class.",
  })
  readonly teacher!: ClassTeacherDto;

  // TODO: this does not work - swagger still shows teacherId
  // and according to https://github.com/nestjs/swagger/issues/527 this won't be fixed
  @Exclude()
  override readonly teacherId!: number;
}
