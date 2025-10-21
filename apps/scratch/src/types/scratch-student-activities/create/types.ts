import {
  StudentAppActivity,
  ActivityRequest,
  StudentActionType,
} from "../common";

export interface StudentCreateActivity extends StudentAppActivity {
  parentId: string | null;
}

export interface CreateActivityRequest extends ActivityRequest {
  action: StudentActionType.Create;
}
