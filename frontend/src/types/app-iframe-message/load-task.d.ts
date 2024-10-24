import {
  RemoteProcedureCallRequest,
  RemoteProcedureCallResponse,
} from "./remote-procedure-call";

type ProcedureName = "loadTask";

export type LoadTaskRequest = RemoteProcedureCallRequest<ProcedureName, Blob>;

export type LoadTaskResponse = RemoteProcedureCallResponse<
  ProcedureName,
  undefined
>;
