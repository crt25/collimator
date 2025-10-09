import type { BaseStudentAppActivity } from "./base.js";

export interface StudentMoveActivity extends BaseStudentAppActivity {
  oldParentId: string | null | undefined;
  newParentId: string | null | undefined;
}
