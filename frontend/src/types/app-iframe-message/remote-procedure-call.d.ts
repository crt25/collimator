type ConditionalArguments<Arguments> = Arguments extends undefined
  ? { arguments?: Arguments }
  : { arguments: Arguments };

export interface RemoteProcedureCallRequest<Procedure extends string, Arguments>
  extends ConditionalArguments<Arguments> {
  type: "request";
  id: number;
  procedure: Procedure;
}

export interface RemoteProcedureCallResponse<Procedure extends string, Result> {
  type: "response";
  id: number;
  procedure: Procedure;
  result: Result;
}
