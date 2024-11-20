import { AnalysisCriterionInputDto } from "./analysis-criterion.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNotEmpty } from "class-validator";
import { Expose, plainToInstance } from "class-transformer";
import {
  Criterion as C,
  CriteriaToAnalyzeInput,
  CriteriaToAnalyzeOutput,
} from "src/data-analyzer/criteria-based-analysis-worker.piscina";

const criterion = C.containsFunctionDeclaration;
type Criterion = typeof criterion;

export class ContainsFunctionDeclarationCriterionInputDto extends AnalysisCriterionInputDto {
  @IsEnum(C)
  @IsNotEmpty()
  @ApiProperty({
    example: criterion,
    description: "The criterion to analyze.",
    enum: [criterion],
  })
  readonly criterion!: Criterion;

  static toAnalysisInput(
    dto: ContainsFunctionDeclarationCriterionInputDto,
  ): CriteriaToAnalyzeInput<Criterion> {
    return {
      criterion: dto.criterion,
      input: undefined,
    };
  }
}

export class ContainsFunctionDeclarationCriterionOutputDto {
  @IsBoolean()
  @ApiProperty({
    example: true,
    description:
      "Whether the analyzed solutions contains a function declaration.",
  })
  @Expose()
  containsFunctionDeclaration!: boolean;

  static fromAnalysisOutput({
    output,
  }: CriteriaToAnalyzeOutput<Criterion>): ContainsFunctionDeclarationCriterionOutputDto {
    return plainToInstance(
      ContainsFunctionDeclarationCriterionOutputDto,
      {
        containsFunctionDeclaration: output,
      } as ContainsFunctionDeclarationCriterionOutputDto,
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
