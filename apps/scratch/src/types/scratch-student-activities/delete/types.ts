import {
  StudentAppActivity,
  ActivityRequest,
  BaseStudentAction,
  StudentAction,
} from "../common";

export type DeletedBlockInfo = Array<{ id: string; type: string }>;

export interface DeletedBlockRecord {
  id: string;
  type: string;
  deletedBlocks: DeletedBlockInfo;
}

export interface StudentDeleteActivity extends StudentAppActivity {
  deletedBlocks: DeletedBlockInfo | null;
}

export interface DeleteActivityRequest extends ActivityRequest {
  action: StudentAction.Delete;
}

export interface DeleteStudentAction extends BaseStudentAction {
  block: DeletedBlockRecord;
}
