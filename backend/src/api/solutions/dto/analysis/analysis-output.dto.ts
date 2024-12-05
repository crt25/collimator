import { ApiExtraModels, ApiProperty, getSchemaPath } from "@nestjs/swagger";
import { CallsFunctionCriterionOutputDto } from "./criteria/calls-function-criterion.dto";
import { ContainsConditionCriterionOutputDto } from "./criteria/contains-condition-criterion.dto";
import { ContainsFunctionDeclarationCriterionOutputDto } from "./criteria/contains-function-declaration-criterion.dto";
import { ContainsLoopDeclarationCriterionOutputDto } from "./criteria/contains-loop-criterion.dto";
import { Expose, plainToInstance } from "class-transformer";
import { IsNotEmpty, IsNumber } from "class-validator";

export type AnyAnalysisCriterionOutputDto =
  | CallsFunctionCriterionOutputDto
  | ContainsConditionCriterionOutputDto
  | ContainsFunctionDeclarationCriterionOutputDto
  | ContainsLoopDeclarationCriterionOutputDto;

@ApiExtraModels(
  CallsFunctionCriterionOutputDto,
  ContainsConditionCriterionOutputDto,
  ContainsFunctionDeclarationCriterionOutputDto,
  ContainsLoopDeclarationCriterionOutputDto,
)
export class AnalysisOutputDto {
  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
    maxDecimalPlaces: 0,
  })
  @IsNotEmpty()
  @ApiProperty({
    example: 318,
    description: "The analyzed solution's unique identifier.",
  })
  @Expose()
  readonly solutionId!: number;

  @ApiProperty({
    description: "The criteria analysis output.",
    isArray: true,
    oneOf: [
      {
        $ref: getSchemaPath(CallsFunctionCriterionOutputDto),
      },
      {
        $ref: getSchemaPath(ContainsConditionCriterionOutputDto),
      },
      {
        $ref: getSchemaPath(ContainsFunctionDeclarationCriterionOutputDto),
      },
      {
        $ref: getSchemaPath(ContainsLoopDeclarationCriterionOutputDto),
      },
    ],
  })
  @Expose()
  readonly criteria!: AnyAnalysisCriterionOutputDto[];

  static fromQueryResult(data: AnalysisOutputDto): AnalysisOutputDto {
    return plainToInstance(AnalysisOutputDto, data, {
      excludeExtraneousValues: true,
    });
  }
}
