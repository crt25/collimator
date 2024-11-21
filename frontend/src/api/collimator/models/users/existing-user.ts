import { ExistingUserDto, UserType } from "../../generated/models";
import { ClassProperties } from "../class-properties";

export class ExistingUser {
  readonly id: number;
  readonly oidcSub: string;
  readonly name: string | null;
  readonly type: UserType;

  protected constructor({
    id,
    oidcSub,
    name,
    type,
  }: ClassProperties<ExistingUser>) {
    this.id = id;
    this.oidcSub = oidcSub;
    this.name = name;
    this.type = type;
  }

  static fromDto(dto: ExistingUserDto): ExistingUser {
    return new ExistingUser(dto);
  }
}
