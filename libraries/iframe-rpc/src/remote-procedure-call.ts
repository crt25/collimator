import { RemoteProcedureCallCaller } from "./remote-procedure-caller";

type ConditionalParameters<Parameters> = Parameters extends undefined
  ? { parameters?: Parameters }
  : { parameters: Parameters };

type ConditionalResult<Result> = Result extends undefined
  ? { result?: Result }
  : { result: Result };

export type RemoteProcedureCallRequestMessageBase<Method extends string> = {
  type: "request";
  id: number;
  method: Method;
};

type RemoteProcedureCallRequestMessage<
  Method extends string,
  Parameters,
> = RemoteProcedureCallRequestMessageBase<Method> &
  ConditionalParameters<Parameters>;

export type RemoteProcedureCallResponseMessageBase<Method extends string> = {
  type: "response";
  id: number;
  method: Method;
};

export type RemoteProcedureCallResponseErrorMessage<Method extends string> = {
  type: "error";
  id: number;
  method: Method;
  error?: string;
};

type RemoteProcedureCallResponseMessage<Method extends string, Result> =
  | (RemoteProcedureCallResponseMessageBase<Method> & ConditionalResult<Result>)
  | RemoteProcedureCallResponseErrorMessage<Method>;

export type RemoteProcedureCall<Definition> = Definition extends {
  method: infer _Method extends string;
  caller: infer _Caller extends RemoteProcedureCallCaller;
  parameters: infer _Parameters;
  result: infer _Result;
}
  ? RemoteProcedureCallConcrete<
      Definition["method"],
      Definition["caller"],
      Definition["parameters"],
      Definition["result"]
    >
  : never;

type RemoteProcedureCallConcrete<
  Method extends string,
  Caller extends RemoteProcedureCallCaller,
  Parameters,
  Result,
> = {
  method: Method;
  caller: Caller;
  request: RemoteProcedureCallRequestMessage<Method, Parameters>;
  response: RemoteProcedureCallResponseMessage<Method, Result>;
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
