import { StudentAppActivity } from "../common";

export interface StudentMoveActivity extends StudentAppActivity {
  // The id of the block's previous parent (null if top-level)
  oldParentId: string | null;

  // The id of the block's new parent (null if top-level)
  newParentId: string | null;
}
