import { StudentAppActivity } from "../common";

export interface StudentChangeActivity extends StudentAppActivity {
  group: string | null;
  element: string | null;
  name: string | null;
  oldValue: unknown;
  newValue: unknown;
}
