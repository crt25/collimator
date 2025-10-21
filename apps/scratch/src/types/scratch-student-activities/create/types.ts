import { StudentAppActivity } from "../common";

export interface StudentCreateActivity extends StudentAppActivity {
  parentId: string | null;
}
