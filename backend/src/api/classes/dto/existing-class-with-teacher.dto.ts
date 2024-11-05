import { ExistingClassDto } from "./existing-class.dto";
import { ApiProperty } from "@nestjs/swagger";
import { Exclude } from "class-transformer";

export class ExistingClassWithTeacherDto extends ExistingClassDto {
  @ApiProperty({
    example: { id: 1, name: "John Doe" },
    description: "The teacher of the class.",
  })
  readonly teacher!: {
    id: number;
    name?: string | null;
  };

  @Exclude()
  override readonly teacherId!: number;
}
