import { DeletedBlockRecord, StudentDeleteActivity } from "./types";
import type { StudentActionType } from "../common";

export type GetDeletePayload = (
  block: DeletedBlockRecord,
  event: StudentActionType.Delete,
) => StudentDeleteActivity | null;
