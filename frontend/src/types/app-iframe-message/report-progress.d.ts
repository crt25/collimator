import {
  RemoteProcedureCallRequest,
  RemoteProcedureCallResponse,
} from "./remote-procedure-call";

type ProcedureName = "reportProgress";

export type ReportProgressRequest = RemoteProcedureCallRequest<
  ProcedureName,
  { tests: number; passedTests: number }
>;

export type ReportProgressReponse = RemoteProcedureCallResponse<
  ProcedureName,
  undefined
>;
