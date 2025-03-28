import { decodeBase64 } from "@/utilities/crypto";
import { TaskReferenceSolutionDto } from "../../generated/models";
import { fromDtos } from "../../hooks/helpers";
import { ClassProperties } from "../class-properties";
import { ExistingSolutionTest } from "../solutions/existing-solution-test";

export class TaskReferenceSolution {
  readonly id: number;
  readonly title: string;
  readonly description: string;
  readonly solution: Blob;
  readonly tests: ExistingSolutionTest[];

  protected constructor({
    id,
    title,
    description,
    solution,
    tests,
  }: ClassProperties<TaskReferenceSolution>) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.solution = solution;
    this.tests = tests;
  }

  static fromDto(dto: TaskReferenceSolutionDto): TaskReferenceSolution {
    return new TaskReferenceSolution({
      ...dto,
      solution: new Blob([decodeBase64(dto.solution)], { type: dto.mimeType }),
      tests: fromDtos(ExistingSolutionTest, dto.tests),
    });
  }
}
