import { IframeRpcMethod } from "../remote-procedure-call";
import { RpcCaller } from "../rpc-caller";

export type Test = {
  /**
   * A technical identifier for the test.
   */
  identifier: string | null;

  /**
   * The name of the test.
   */
  name: string;

  /**
   * The name of the test's context such as the file it is in or
   * the scratch target.
   */
  contextName: string | null;
};

export type Submission = {
  file: Blob;
  passedTests: Test[];
  failedTests: Test[];
};

export type GetSubmission = IframeRpcMethod<{
  method: "getSubmission";
  caller: RpcCaller.CrtPlatform;
  parameters: undefined;
  result: Submission;
}>;
