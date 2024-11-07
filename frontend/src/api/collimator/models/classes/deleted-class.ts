import { DeletedClassDto } from "../../generated/models";
import { ClassProperties } from "../class-properties";

export class DeletedClass {
  readonly id: number;
  readonly name: string;
  readonly teacherId: number;

  protected constructor({
    id,
    name,
    teacherId,
  }: ClassProperties<DeletedClass>) {
    this.id = id;
    this.name = name;
    this.teacherId = teacherId;
  }

  static fromDto(dto: DeletedClassDto): DeletedClass {
    return new DeletedClass(dto);
  }
}
