import {
  RemoteProcedureCallRequest,
  RemoteProcedureCallResponse,
} from "./remote-procedure-call";

type ProcedureName = "getSubmission";

export type GetSubmissionRequest = RemoteProcedureCallRequest<
  ProcedureName,
  undefined
>;

export type GetSubmissionResponse = RemoteProcedureCallResponse<
  ProcedureName,
  {
    file: Blob;
    totalTests: number;
    passedTests: number;
  }
>;
