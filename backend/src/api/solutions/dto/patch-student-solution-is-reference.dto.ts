import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { IsBoolean } from "class-validator";

export class PatchStudentSolutionIsReferenceDto {
  @Type(() => Boolean)
  @IsBoolean()
  @ApiProperty()
  @Expose()
  readonly isReference!: boolean;
}
