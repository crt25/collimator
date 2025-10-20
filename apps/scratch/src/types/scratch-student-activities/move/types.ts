import {
  BaseStudentAppActivity,
  BaseActivityRequest,
  StudentAction,
} from "../common";

export interface StudentMoveActivity extends BaseStudentAppActivity {
  oldParentId: string | null;
  newParentId: string | null;
}

export interface MoveActivityRequest extends BaseActivityRequest {
  action: StudentAction.Move;
}
