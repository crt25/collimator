import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToInstance, Type } from "class-transformer";
import { SolutionTest } from "@prisma/client";
import { IsBoolean, IsString } from "class-validator";

export class CreateSolutionTestDto {
  // @Type converts the input to the given type - necessary because this may be submitted as part of a multipart/form-data

  @Type(() => String)
  @IsString()
  @ApiProperty({
    example: "MyAssemblyNamespace.MyClass.MyMethod",
    description:
      "The test's unique identifier, internal to the respective task.",
    type: "string",
    nullable: true,
  })
  @Expose()
  readonly identifier!: string | null;

  @Type(() => String)
  @IsString()
  @ApiProperty({
    example: "Check that the function's return value is positive",
    description: "The name of the test",
    type: "string",
  })
  @Expose()
  readonly name!: string;

  @Type(() => String)
  @IsString()
  @ApiProperty({
    example: "SomeFolder/MyClass.cs",
    description: "A name for the context the test is in, e.g. the filename.",
    type: "string",
    nullable: true,
  })
  @Expose()
  readonly contextName!: string | null;

  @Type(() => Boolean)
  @IsBoolean()
  @ApiProperty({
    example: "true",
    description: "Whether said test passed",
    type: "boolean",
  })
  @Expose()
  readonly passed!: boolean;

  static fromQueryResult(
    data: Omit<
      SolutionTest,
      "id" | "referenceSolutionId" | "studentSolutionId"
    >,
  ): CreateSolutionTestDto {
    return plainToInstance(CreateSolutionTestDto, data, {
      excludeExtraneousValues: true,
    });
  }
}
