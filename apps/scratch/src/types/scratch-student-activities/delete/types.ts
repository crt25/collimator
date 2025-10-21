import {
  StudentAppActivity,
  ActivityRequest,
  StudentActionContext,
  StudentActionType,
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
  action: StudentActionType.Delete;
}

export interface DeleteStudentActionType extends StudentActionContext {
  block: DeletedBlockRecord;
}
