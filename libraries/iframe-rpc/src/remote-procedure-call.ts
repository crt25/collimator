import { RemoteProcedureCallCaller } from "./remote-procedure-caller";

type ConditionalArguments<Arguments> = Arguments extends undefined
  ? { arguments?: Arguments }
  : { arguments: Arguments };

type ConditionalResult<Result> = Result extends undefined
  ? { result?: Result }
  : { result: Result };

export type RemoteProcedureCallRequestMessageBase<Procedure extends string> = {
  type: "request";
  id: number;
  procedure: Procedure;
};

type RemoteProcedureCallRequestMessage<
  Procedure extends string,
  Arguments,
> = RemoteProcedureCallRequestMessageBase<Procedure> &
  ConditionalArguments<Arguments>;

export type RemoteProcedureCallResponseMessageBase<Procedure extends string> = {
  type: "response";
  id: number;
  procedure: Procedure;
};

export type RemoteProcedureCallResponseErrorMessage<Procedure extends string> =
  {
    type: "error";
    id: number;
    procedure: Procedure;
    error?: string;
  };

type RemoteProcedureCallResponseMessage<Procedure extends string, Result> =
  | (RemoteProcedureCallResponseMessageBase<Procedure> &
      ConditionalResult<Result>)
  | RemoteProcedureCallResponseErrorMessage<Procedure>;

export type RemoteProcedureCall<Definition> = Definition extends {
  procedure: infer _Procedure extends string;
  caller: infer _Caller extends RemoteProcedureCallCaller;
  arguments: infer _Arguments;
  result: infer _Result;
}
  ? RemoteProcedureCallConcrete<
      Definition["procedure"],
      Definition["caller"],
      Definition["arguments"],
      Definition["result"]
    >
  : never;

type RemoteProcedureCallConcrete<
  Procedure extends string,
  Caller extends RemoteProcedureCallCaller,
  Arguments,
  Result,
> = {
  procedure: Procedure;
  caller: Caller;
  request: RemoteProcedureCallRequestMessage<Procedure, Arguments>;
  response: RemoteProcedureCallResponseMessage<Procedure, Result>;
};

export type RemoteProcedureCallRequest<Rpc> =
  Rpc extends RemoteProcedureCallConcrete<
    infer _Procedure,
    infer _Caller,
    infer _Arguments,
    infer _Result
  >
    ? Rpc["request"]
    : never;

export type RemoteProcedureCallProcedure<Rpc> =
  Rpc extends RemoteProcedureCallConcrete<
    infer Procedure,
    infer _Caller,
    infer _Arguments,
    infer _Result
  >
    ? Procedure
    : never;

export type RemoteProcedureCallResponse<Rpc> =
  Rpc extends RemoteProcedureCallConcrete<
    infer _Procedure,
    infer _Caller,
    infer _Arguments,
    infer _Result
  >
    ? Rpc["response"]
    : never;
