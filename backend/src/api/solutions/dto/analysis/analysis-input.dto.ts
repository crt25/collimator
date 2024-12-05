import { ApiExtraModels, ApiProperty, getSchemaPath } from "@nestjs/swagger";
import { CallsFunctionCriterionInputDto } from "./criteria/calls-function-criterion.dto";
import { ContainsConditionCriterionInputDto } from "./criteria/contains-condition-criterion.dto";
import { ContainsFunctionDeclarationCriterionInputDto } from "./criteria/contains-function-declaration-criterion.dto";
import { ContainsLoopDeclarationCriterionInputDto } from "./criteria/contains-loop-criterion.dto";
import { ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { Criterion } from "src/data-analyzer/criteria-based-analysis-worker.piscina";
import { AnalysisCriterionInputDto } from "./criteria/analysis-criterion.dto";

type AnyAnalysisCriterionInputDto =
  | CallsFunctionCriterionInputDto
  | ContainsConditionCriterionInputDto
  | ContainsFunctionDeclarationCriterionInputDto
  | ContainsLoopDeclarationCriterionInputDto;

@ApiExtraModels(
  CallsFunctionCriterionInputDto,
  ContainsConditionCriterionInputDto,
  ContainsFunctionDeclarationCriterionInputDto,
  ContainsLoopDeclarationCriterionInputDto,
)
export class AnalysisInputDto {
  @ValidateNested({ each: true })
  @Type(() => AnalysisCriterionInputDto, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: "criterion",
      subTypes: [
        {
          name: Criterion.callsFunction,
          value: CallsFunctionCriterionInputDto,
        },
        {
          name: Criterion.containsCondition,
          value: ContainsConditionCriterionInputDto,
        },
        {
          name: Criterion.containsFunctionDeclaration,
          value: ContainsFunctionDeclarationCriterionInputDto,
        },
        {
          name: Criterion.containsLoop,
          value: ContainsLoopDeclarationCriterionInputDto,
        },
      ],
    },
  })
  @ApiProperty({
    description: "The criteria to analyze.",
    isArray: true,
    oneOf: [
      {
        $ref: getSchemaPath(CallsFunctionCriterionInputDto),
      },
      {
        $ref: getSchemaPath(ContainsConditionCriterionInputDto),
      },
      {
        $ref: getSchemaPath(ContainsFunctionDeclarationCriterionInputDto),
      },
      {
        $ref: getSchemaPath(ContainsLoopDeclarationCriterionInputDto),
      },
    ],
  })
  readonly criteria!: AnyAnalysisCriterionInputDto[];
}
