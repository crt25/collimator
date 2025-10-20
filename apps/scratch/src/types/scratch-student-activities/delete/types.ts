import {
  BaseStudentAppActivity,
  BaseActivityRequest,
  BaseStudentAction,
  StudentAction,
} from "../common";

import {
  DeletedBlockInfo,
  DeletedBlockRecord,
} from "../../../utilities/scratch-block";

export interface StudentDeleteActivity extends BaseStudentAppActivity {
  blockIdArray: DeletedBlockInfo | null;
  sizeOfDeletion: number | null;
}

export interface DeleteActivityRequest extends BaseActivityRequest {
  action: StudentAction.Delete;
}

export interface DeleteStudentAction extends BaseStudentAction {
  block: DeletedBlockRecord;
}
