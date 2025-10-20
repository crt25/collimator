import { StudentCreateActivity } from "./types";
import type { Block } from "scratch-blocks";
import type { StudentAction } from "../common";

export type GetCreatePayload = (
  block: Block,
  event: StudentAction.Create,
) => StudentCreateActivity | null;
