import { Language } from "./languages";
import {
  RemoteProcedureCallRequest,
  RemoteProcedureCallResponse,
} from "./remote-procedure-call";

type ProcedureName = "loadTask";

export type LoadTaskRequest = RemoteProcedureCallRequest<
  ProcedureName,
  {
    task: Blob;
    language: Language;
  }
>;

export type LoadTaskResponse = RemoteProcedureCallResponse<
  ProcedureName,
  undefined
>;
