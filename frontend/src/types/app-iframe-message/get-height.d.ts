import {
  RemoteProcedureCallRequest,
  RemoteProcedureCallResponse,
} from "./remote-procedure-call";

type ProcedureName = "getHeight";

export type GetHeightRequest = RemoteProcedureCallRequest<
  ProcedureName,
  undefined
>;
export type GetHeightReponse = RemoteProcedureCallResponse<
  ProcedureName,
  number
>;
