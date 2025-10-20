import {
  BaseStudentAppActivity,
  BaseActivityRequest,
  StudentAction,
} from "../common";

export interface StudentCreateActivity extends BaseStudentAppActivity {
  parentId: string | null;
}

export interface CreateActivityRequest extends BaseActivityRequest {
  action: StudentAction.Create;
}
