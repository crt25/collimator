import { GeneralAst } from "@ast/index";
import { ClassProperties } from "../class-properties";
import { fromDtos } from "../../hooks/helpers";
import { ReferenceAnalysisDto } from "../../generated/models";
import { ExistingSolutionTest } from "./existing-solution-test";
import { CurrentAnalysis } from "./current-analysis";

export class ReferenceAnalysis extends CurrentAnalysis {
  readonly referenceSolutionId: number;
  readonly title: string;
  readonly description: string;

  protected constructor({
    referenceSolutionId,
    title,
    description,
    ...rest
  }: ClassProperties<ReferenceAnalysis, "solutionId">) {
    super(rest);

    this.referenceSolutionId = referenceSolutionId;
    this.title = title;
    this.description = description;
  }

  public override get solutionId(): string {
    return `REFERENCE:${this.referenceSolutionId}`;
  }

  protected override withAst(ast: GeneralAst): ReferenceAnalysis {
    return new ReferenceAnalysis({ ...this, generalAst: ast });
  }

  static fromDto(dto: ReferenceAnalysisDto): ReferenceAnalysis {
    return new ReferenceAnalysis({
      ...dto,
      generalAst: JSON.parse(dto.genericAst),
      tests: fromDtos(ExistingSolutionTest, dto.tests),
    });
  }
}
