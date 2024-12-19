import { Language } from "./languages";
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
    subTaskId?: string;
    language: Language;
  }
>;

export type LoadSubmissionResponse = RemoteProcedureCallResponse<
  ProcedureName,
  undefined
>;
