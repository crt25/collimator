import {
  IframeRpcDefinition,
  IframeRpcRequest,
  IframeRpcResult,
} from "./remote-procedure-call";

export type RequestOf<Rpc> =
  Rpc extends IframeRpcDefinition<
    infer _Method,
    infer _Caller,
    infer _Parameters,
    infer _Result
  >
    ? Rpc["request"]
    : never;

export type MethodOf<Rpc> =
  Rpc extends IframeRpcDefinition<
    infer Method,
    infer _Caller,
    infer _Parameters,
    infer _Result
  >
    ? Method
    : never;

export type ResponseOf<Rpc> =
  Rpc extends IframeRpcDefinition<
    infer _Method,
    infer _Caller,
    infer _Parameters,
    infer _Result
  >
    ? Rpc["response"]
    : never;

export type ParametersOf<Rpc> =
  Rpc extends IframeRpcRequest<infer _Method, infer Parameters>
    ? Parameters
    : undefined;

export type ResultOf<Rpc> =
  Rpc extends IframeRpcResult<infer _Method, infer Result> ? Result : undefined;
