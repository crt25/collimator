type ConditionalArguments<Arguments> = Arguments extends undefined
  ? { arguments?: Arguments }
  : { arguments: Arguments };

type ConditionalResult<Result> = Result extends undefined
  ? { result?: Result }
  : { result: Result };

export type RemoteProcedureCallRequest<Procedure extends string, Arguments> = {
  type: "request";
  id: number;
  procedure: Procedure;
} & ConditionalArguments<Arguments>;

export type RemoteProcedureCallResponse<Procedure extends string, Result> = {
  type: "response";
  id: number;
  procedure: Procedure;
} & ConditionalResult<Result>;
