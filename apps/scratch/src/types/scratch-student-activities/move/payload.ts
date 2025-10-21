import { StudentMoveActivity } from "./types";
import type { Block } from "scratch-blocks";
import type { StudentActionType } from "../common";

export type GetMovePayload = (
  block: Block,
  event: StudentActionType.Move,
) => StudentMoveActivity | null;
