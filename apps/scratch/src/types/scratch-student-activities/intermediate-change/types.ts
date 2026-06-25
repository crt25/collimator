import { StudentAppActivity } from "../common";

export interface StudentIntermediateChangeActivity extends StudentAppActivity {
  group: string | null;
  name: string | null;
  oldValue: unknown;
  newValue: unknown;
}
