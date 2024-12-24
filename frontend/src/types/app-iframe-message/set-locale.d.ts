import { Language } from "./languages";
import {
  RemoteProcedureCallRequest,
  RemoteProcedureCallResponse,
} from "./remote-procedure-call";

type ProcedureName = "setLocale";

export type SetLocaleRequest = RemoteProcedureCallRequest<
  ProcedureName,
  Language
>;

export type SetLocaleResponse = RemoteProcedureCallResponse<
  ProcedureName,
  undefined
>;
