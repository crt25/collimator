import { RemoteProcedureCallCaller } from "./remote-procedure-caller";

type ConditionalParameters<Parameters> = Parameters extends undefined
  ? { parameters?: Parameters }
  : { parameters: Parameters };

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
  Parameters,
> = RemoteProcedureCallRequestMessageBase<Procedure> &
  ConditionalParameters<Parameters>;

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
  parameters: infer _Parameters;
  result: infer _Result;
}
  ? RemoteProcedureCallConcrete<
      Definition["procedure"],
      Definition["caller"],
      Definition["parameters"],
      Definition["result"]
    >
  : never;

type RemoteProcedureCallConcrete<
  Procedure extends string,
  Caller extends RemoteProcedureCallCaller,
  Parameters,
  Result,
> = {
  procedure: Procedure;
  caller: Caller;
  request: RemoteProcedureCallRequestMessage<Procedure, Parameters>;
  response: RemoteProcedureCallResponseMessage<Procedure, Result>;
};

export type RemoteProcedureCallRequest<Rpc> =
  Rpc extends RemoteProcedureCallConcrete<
    infer _Procedure,
    infer _Caller,
    infer _Parameters,
    infer _Result
  >
    ? Rpc["request"]
    : never;

export type RemoteProcedureCallProcedure<Rpc> =
  Rpc extends RemoteProcedureCallConcrete<
    infer Procedure,
    infer _Caller,
    infer _Parameters,
    infer _Result
  >
    ? Procedure
    : never;

export type RemoteProcedureCallResponse<Rpc> =
  Rpc extends RemoteProcedureCallConcrete<
    infer _Procedure,
    infer _Caller,
    infer _Parameters,
    infer _Result
  >
    ? Rpc["response"]
    : never;
