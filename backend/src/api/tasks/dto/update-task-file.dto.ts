import { ApiProperty } from "@nestjs/swagger";

export class UpdateTaskFileDto {
  // The following property is used for Swagger documentation purposes.
  @ApiProperty({
    description: "Task file",
    format: "binary",
    type: "string",
  })
  readonly file!: Express.Multer.File;
}
