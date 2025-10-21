import { StudentAppActivity, ActivityRequest, StudentAction } from "../common";

export interface StudentMoveActivity extends StudentAppActivity {
  oldParentId: string | null;
  newParentId: string | null;
}

export interface MoveActivityRequest extends ActivityRequest {
  action: StudentAction.Move;
}
