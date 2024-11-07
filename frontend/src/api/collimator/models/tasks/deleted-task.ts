import { DeletedTaskDto} from "../../generated/models";
import { ClassProperties } from "../class-properties";
import { ExistingTask } from "./existing-task";

export class DeletedTask extends ExistingTask {

  protected constructor(props: ClassProperties<ExistingTask>) {
    super(props);
  }

  static fromDto(dto: DeletedTaskDto): ExistingTask {
    return new ExistingTask(dto);
  }
}
