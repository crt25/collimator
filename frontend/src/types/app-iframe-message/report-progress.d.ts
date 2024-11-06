import {
  RemoteProcedureCallRequest,
  RemoteProcedureCallResponse,
} from "./remote-procedure-call";

type ProcedureName = "reportProgress";

export type ReportProgressRequest = RemoteProcedureCallRequest<
  ProcedureName,
  { totalTests: number; passedTests: number }
>;

export type ReportProgressReponse = RemoteProcedureCallResponse<
  ProcedureName,
  undefined
>;
