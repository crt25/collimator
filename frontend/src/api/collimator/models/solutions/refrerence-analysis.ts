import { GeneralAst } from "@ast/index";
import { ClassProperties } from "../class-properties";
import { fromDtos } from "../../hooks/helpers";
import { ReferenceAnalysisDto } from "../../generated/models";
import { SolutionTest } from "./solution-test";
import { CurrentAnalysis } from "./current-analysis";

export class ReferenceAnalysis extends CurrentAnalysis {
  readonly referenceSolutionId: number;

  protected constructor({
    referenceSolutionId,
    ...rest
  }: ClassProperties<ReferenceAnalysis, "sourceId">) {
    super(rest);

    this.referenceSolutionId = referenceSolutionId;
  }

  public override get sourceId(): string {
    return `REFERENCE:${this.referenceSolutionId}`;
  }

  protected override withAst(ast: GeneralAst): ReferenceAnalysis {
    return new ReferenceAnalysis({ ...this, generalAst: ast });
  }

  static fromDto(dto: ReferenceAnalysisDto): ReferenceAnalysis {
    return new ReferenceAnalysis({
      ...dto,
      generalAst: JSON.parse(dto.genericAst),
      tests: fromDtos(SolutionTest, dto.tests),
    });
  }
}
