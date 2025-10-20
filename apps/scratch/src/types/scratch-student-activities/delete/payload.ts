import { DeletedBlockRecord } from "../../../utilities/scratch-block";
import { StudentDeleteActivity } from "./types";
import type { StudentAction } from "../common";

export type GetDeletePayload = (
  block: DeletedBlockRecord,
  event: StudentAction.Delete,
) => StudentDeleteActivity | null;
