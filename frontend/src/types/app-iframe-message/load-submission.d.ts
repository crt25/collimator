import {
  RemoteProcedureCallRequest,
  RemoteProcedureCallResponse,
} from "./remote-procedure-call";

type ProcedureName = "loadSubmission";

export type LoadSubmissionRequest = RemoteProcedureCallRequest<
  ProcedureName,
  {
    task: Blob;
    submission: Blob;
  }
>;

export type LoadSubmissionResponse = RemoteProcedureCallResponse<
  ProcedureName,
  undefined
>;
