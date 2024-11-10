import { ApiProperty } from "@nestjs/swagger";

export class CreateSolutionDto {
  // The following property is used for Swagger documentation purposes.
  @ApiProperty({
    description: "Solution file",
    format: "binary",
    type: "string",
  })
  readonly file!: Express.Multer.File;
}
