import { StudentAppActivity } from "../common";

export interface StudentIntermediateFieldChangeActivity
  extends StudentAppActivity {
  group: string | null;
  name: string | null;
  oldValue: unknown;
  newValue: unknown;
}
