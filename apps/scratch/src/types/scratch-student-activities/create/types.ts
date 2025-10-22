import { StudentAppActivity } from "../common";

export interface StudentCreateActivity extends StudentAppActivity {
  /** This is null if this is a top level block */
  parentId: string | null;
}
