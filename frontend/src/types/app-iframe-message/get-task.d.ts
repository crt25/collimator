import {
  RemoteProcedureCallRequest,
  RemoteProcedureCallResponse,
} from "./remote-procedure-call";

type ProcedureName = "getTask";

export type GetTaskRequest = RemoteProcedureCallRequest<
  ProcedureName,
  undefined
>;

export type GetTaskResponse = RemoteProcedureCallResponse<ProcedureName, Blob>;
