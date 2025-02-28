import {
  RemoteProcedureCallRequest,
  RemoteProcedureCallResponse,
} from "./remote-procedure-call";

type ProcedureName = "getSubmission";

export type GetSubmissionRequest = RemoteProcedureCallRequest<
  ProcedureName,
  undefined
>;

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

export type GetSubmissionResponse = RemoteProcedureCallResponse<
  ProcedureName,
  {
    file: Blob;
    passedTests: Test[];
    failedTests: Test[];
  }
>;
