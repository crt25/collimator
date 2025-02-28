import { ClassProperties } from "../class-properties";
import { SolutionTestDto } from "../../generated/models";

export class SolutionTest {
  readonly name: string;
  readonly identifier: string | null;
  readonly contextName: string | null;
  readonly passed: boolean;

  protected constructor({
    name,
    identifier,
    contextName,
    passed,
  }: ClassProperties<SolutionTest>) {
    this.name = name;
    this.identifier = identifier;
    this.contextName = contextName;
    this.passed = passed;
  }

  static fromDto(dto: SolutionTestDto): SolutionTest {
    return new SolutionTest(dto);
  }
}
