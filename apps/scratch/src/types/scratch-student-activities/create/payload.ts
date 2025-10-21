import { StudentCreateActivity } from "./types";
import type { Block } from "scratch-blocks";
import type { StudentActionType } from "../common";

export type GetCreatePayload = (
  block: Block,
  event: StudentActionType.Create,
) => StudentCreateActivity | null;
