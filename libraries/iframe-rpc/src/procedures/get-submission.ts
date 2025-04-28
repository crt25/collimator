import { RemoteProcedureCall } from "../remote-procedure-call";
import { RemoteProcedureCallCaller } from "../remote-procedure-caller";

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

export type GetSubmission = RemoteProcedureCall<{
  procedure: "getSubmission";
  caller: RemoteProcedureCallCaller.Platform;
  arguments: undefined;
  result: Submission;
}>;
