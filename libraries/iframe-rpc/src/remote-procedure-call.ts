import { RpcCaller } from "./rpc-caller";

type ConditionalParameters<Parameters> = Parameters extends undefined
  ? { parameters?: unknown }
  : { parameters: Parameters };

type ConditionalResult<Result> = Result extends undefined
  ? { result?: unknown }
  : { result: Result };

export type IframeRpcRequest<Method extends string, Parameters = undefined> = {
  jsonrpc: "2.0";
  id: number;
  method: Method;
} & ConditionalParameters<Parameters>;

export type IframeRpcResult<Method extends string, Result = undefined> = {
  jsonrpc: "2.0";
  id: number;
  method: Method;
} & ConditionalResult<Result>;

export type IframeRpcError<Method extends string> = {
  jsonrpc: "2.0";
  id: number;
  method: Method;
  error?: string;
};

export type IframeRpcMethod<Definition> = Definition extends {
  method: infer _Method extends string;
  caller: infer _Caller extends RpcCaller;
  parameters: infer _Parameters;
  result: infer _Result;
}
  ? IframeRpcDefinition<
      Definition["method"],
      Definition["caller"],
      Definition["parameters"],
      Definition["result"]
    >
  : never;

export type IframeRpcDefinition<
  Method extends string,
  Caller extends RpcCaller,
  Parameters,
  Result,
> = {
  method: Method;
  caller: Caller;
  request: IframeRpcRequest<Method, Parameters>;
  response: IframeRpcResult<Method, Result>;
};
