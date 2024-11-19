import { AnalysisCriterionInputDto } from "./analysis-criterion.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNotEmpty } from "class-validator";
import { Expose, plainToInstance } from "class-transformer";
import {
  Criterion as C,
  CriteriaToAnalyzeInput,
  CriteriaToAnalyzeOutput,
} from "src/data-analyzer/criteria-based-analysis-worker.piscina";

const criterion = C.containsCondition;
type Criterion = typeof criterion;

export class ContainsConditionCriterionInputDto extends AnalysisCriterionInputDto {
  @IsEnum(C)
  @IsNotEmpty()
  @ApiProperty({
    example: criterion,
    description: "The criterion to analyze.",
    enum: [criterion],
  })
  readonly criterion!: Criterion;

  static toAnalysisInput(
    dto: ContainsConditionCriterionInputDto,
  ): CriteriaToAnalyzeInput<Criterion> {
    return {
      criterion: dto.criterion,
      input: undefined,
    };
  }
}

export class ContainsConditionCriterionOutputDto {
  @IsBoolean()
  @ApiProperty({
    example: true,
    description: "Whether the analyzed solutions contains a condition.",
  })
  @Expose()
  containsCondition!: boolean;

  static fromAnalysisOutput({
    output,
  }: CriteriaToAnalyzeOutput<Criterion>): ContainsConditionCriterionOutputDto {
    return plainToInstance(
      ContainsConditionCriterionOutputDto,
      {
        containsCondition: output,
      } as ContainsConditionCriterionOutputDto,
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
