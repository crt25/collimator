import { DeletedUserDto, UserType } from "../../generated/models";
import { ClassProperties } from "../class-properties";

export class DeletedUser {
  readonly id: number;
  readonly email: string;
  readonly oidcSub: string | null;
  readonly name: string | null;
  readonly type: UserType;

  protected constructor({
    id,
    email,
    oidcSub,
    name,
    type,
  }: ClassProperties<DeletedUser>) {
    this.id = id;
    this.email = email;
    this.oidcSub = oidcSub;
    this.name = name;
    this.type = type;
  }

  static fromDto(dto: DeletedUserDto): DeletedUser {
    return new DeletedUser(dto);
  }
}
