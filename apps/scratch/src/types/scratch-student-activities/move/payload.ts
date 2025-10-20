import { StudentMoveActivity } from "./types";
import type { Block } from "scratch-blocks";
import type { StudentAction } from "../common";

export type GetMovePayload = (
  block: Block,
  event: StudentAction.Move,
) => StudentMoveActivity | null;
