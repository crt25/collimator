import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { AnalysisCriterionInputDto } from "./analysis-criterion.dto";
import { Expose, plainToInstance } from "class-transformer";
import {
  Criterion as C,
  CriteriaToAnalyzeInput,
  CriteriaToAnalyzeOutput,
} from "src/data-analyzer/criteria-based-analysis-worker.piscina";

const criterion = C.callsFunction;
type Criterion = typeof criterion;

export class CallsFunctionCriterionInputDto extends AnalysisCriterionInputDto {
  @IsEnum(C)
  @IsNotEmpty()
  @ApiProperty({
    example: criterion,
    description: "The criterion to analyze.",
    enum: [criterion],
  })
  readonly criterion!: Criterion;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: "motion_movesteps",
    description: "The name of the function to check for.",
  })
  functionName!: string;

  static toAnalysisInput(
    dto: CallsFunctionCriterionInputDto,
  ): CriteriaToAnalyzeInput<Criterion> {
    return {
      criterion: dto.criterion,
      input: {
        functionName: dto.functionName,
      },
    };
  }
}

export class CallsFunctionCriterionOutputDto {
  @IsBoolean()
  @ApiProperty({
    example: true,
    description:
      "Whether the analyzed solutions calls the provided function name.",
  })
  @Expose()
  callsFunction!: boolean;

  static fromAnalysisOutput({
    output,
  }: CriteriaToAnalyzeOutput<Criterion>): CallsFunctionCriterionOutputDto {
    return plainToInstance(
      CallsFunctionCriterionOutputDto,
      {
        callsFunction: output,
      } as CallsFunctionCriterionOutputDto,
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
