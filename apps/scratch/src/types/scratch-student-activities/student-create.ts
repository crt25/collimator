import type { BaseStudentAppActivity } from "./base.js";

export interface StudentCreateActivity extends BaseStudentAppActivity {
  parentId: string | null | undefined;
}
