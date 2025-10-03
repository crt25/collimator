export const RPC_METHODS = {
  GET_SUBMISSION: "getSubmission",
  GET_TASK: "getTask",
  GET_HEIGHT: "getHeight",
  LOAD_SUBMISSION: "loadSubmission",
  LOAD_TASK: "loadTask",
  SET_LOCALE: "setLocale",
  POST_SUBMISSION: "postSubmission",
  POST_STUDENT_ACTIVITY: "postStudentActivity",
  POST_SOLUTION_RUN: "postSolutionRun",
};

export type RpcMethodName = (typeof RPC_METHODS)[keyof typeof RPC_METHODS];
