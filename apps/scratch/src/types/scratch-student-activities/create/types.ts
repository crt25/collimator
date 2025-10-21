import { StudentAppActivity, ActivityRequest, StudentAction } from "../common";

export interface StudentCreateActivity extends StudentAppActivity {
  parentId: string | null;
}

export interface CreateActivityRequest extends ActivityRequest {
  action: StudentAction.Create;
}
