import { ExistingSolutionDto } from "../../generated/models";
import { ClassProperties } from "../class-properties";

export class ExistingSolution {
  readonly hash: string;
  readonly taskId: number;

  protected constructor({ hash, taskId }: ClassProperties<ExistingSolution>) {
    this.hash = hash;
    this.taskId = taskId;
  }

  static fromDto(dto: ExistingSolutionDto): ExistingSolution {
    return new ExistingSolution(dto);
  }
}
