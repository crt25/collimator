import { GeneralAst } from "@ast/index";
import { ClassProperties } from "../class-properties";
import { fromDtos } from "../../hooks/helpers";
import { ReferenceAnalysisDto } from "../../generated/models";
import { ExistingSolutionTest } from "./existing-solution-test";
import { CurrentAnalysis } from "./current-analysis";

export class ReferenceAnalysis extends CurrentAnalysis {
  readonly referenceSolutionId: number;

  protected constructor({
    referenceSolutionId,
    ...rest
  }: ClassProperties<ReferenceAnalysis, "sourceId" | "solutionId">) {
    super(rest);

    this.referenceSolutionId = referenceSolutionId;
  }

  public override get sourceId(): string {
    return `REFERENCE:${this.referenceSolutionId}`;
  }

  public override get solutionId(): string {
    return `REFERENCE:${this.solutionId}`;
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
