import { AnalysisCriterionInputDto } from "./analysis-criterion.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNotEmpty } from "class-validator";
import { Expose, plainToInstance } from "class-transformer";
import {
  Criterion as C,
  CriteriaToAnalyzeInput,
  CriteriaToAnalyzeOutput,
} from "src/data-analyzer/criteria-based-analysis-worker.piscina";

const criterion = C.containsLoop;
type Criterion = typeof criterion;

export class ContainsLoopDeclarationCriterionInputDto extends AnalysisCriterionInputDto {
  @IsEnum(C)
  @IsNotEmpty()
  @ApiProperty({
    example: criterion,
    description: "The criterion to analyze.",
    enum: [criterion],
  })
  readonly criterion!: Criterion;

  static toAnalysisInput(
    dto: ContainsLoopDeclarationCriterionInputDto,
  ): CriteriaToAnalyzeInput<Criterion> {
    return {
      criterion: dto.criterion,
      input: undefined,
    };
  }
}

export class ContainsLoopDeclarationCriterionOutputDto {
  @IsBoolean()
  @ApiProperty({
    example: true,
    description: "Whether the analyzed solutions contains a loop.",
  })
  @Expose()
  containsLoop!: boolean;

  static fromAnalysisOutput({
    output,
  }: CriteriaToAnalyzeOutput<Criterion>): ContainsLoopDeclarationCriterionOutputDto {
    return plainToInstance(
      ContainsLoopDeclarationCriterionOutputDto,
      {
        containsLoop: output,
      } as ContainsLoopDeclarationCriterionOutputDto,
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
