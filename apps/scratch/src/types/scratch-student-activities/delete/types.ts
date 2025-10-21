import {
  BaseStudentAppActivity,
  BaseActivityRequest,
  BaseStudentAction,
  StudentAction,
} from "../common";

export type DeletedBlockInfo = Array<{ id: string; type: string }>;

export interface DeletedBlockRecord {
  id: string;
  type: string;
  blockIdArray: DeletedBlockInfo;
}

export interface StudentDeleteActivity extends BaseStudentAppActivity {
  blockIdArray: DeletedBlockInfo | null;
}

export interface DeleteActivityRequest extends BaseActivityRequest {
  action: StudentAction.Delete;
}

export interface DeleteStudentAction extends BaseStudentAction {
  block: DeletedBlockRecord;
}
