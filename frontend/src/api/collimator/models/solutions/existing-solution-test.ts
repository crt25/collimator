import { ExistingSolutionTestDto } from "../../generated/models";
import { ClassProperties } from "../class-properties";

export class ExistingSolutionTest {
  readonly id: number;
  readonly name: string;
  readonly identifier: string | null;
  readonly contextName: string | null;
  readonly passed: boolean;

  protected constructor({
    id,
    name,
    identifier,
    contextName,
    passed,
  }: ClassProperties<ExistingSolutionTest>) {
    this.id = id;
    this.name = name;
    this.identifier = identifier;
    this.contextName = contextName;
    this.passed = passed;
  }

  static fromDto(dto: ExistingSolutionTestDto): ExistingSolutionTest {
    return new ExistingSolutionTest(dto);
  }
}
