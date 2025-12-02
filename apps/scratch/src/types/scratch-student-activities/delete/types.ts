import { StudentAppActivity, StudentActionContext } from "../common";

export type DeletedBlockInfo = { id: string; type: string }[];

export interface DeletedBlockRecord {
  id: string;
  type: string;
  deletedBlocks: DeletedBlockInfo;
}

export interface StudentDeleteActivity extends StudentAppActivity {
  deletedBlocks: DeletedBlockInfo | null;
}

export interface DeleteStudentAction
  extends Omit<StudentActionContext, "block"> {
  block: DeletedBlockRecord;
}
