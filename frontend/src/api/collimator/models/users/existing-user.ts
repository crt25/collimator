import { ExistingUserDto, UserType } from "../../generated/models";
import { ClassProperties } from "../class-properties";

export class ExistingUser {
  readonly id: number;
  readonly email: string;
  readonly name: string | null;
  readonly type: UserType;

  protected constructor({
    id,
    email,
    name,
    type,
  }: ClassProperties<ExistingUser>) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.type = type;
  }

  static fromDto(dto: ExistingUserDto): ExistingUser {
    return new ExistingUser(dto);
  }
}
