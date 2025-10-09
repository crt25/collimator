import { LiteBlock } from "scratch-blocks";
import type { BaseStudentAppActivity } from "./base.js";

export interface StudentDeleteActivity extends BaseStudentAppActivity {
  blockIdArray: LiteBlock[];
  sizeOfDeletion: number | null | undefined;
}
