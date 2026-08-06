import { Language } from "../languages";
import { IframeRpcMethod } from "../remote-procedure-call";
import { RpcCaller } from "../rpc-caller";

/**
 * Emitted by the app once it has loaded a task for a solving student, carrying
 * the solution the task was opened with (the app's own encoding, not the
 * platform's stored task/submission file) and the language it was presented in.
 * The platform records it as a TASK_STARTED student activity: it marks the
 * starting point when replaying a student's interactions and makes the student
 * visible in the progress view before they submit anything. The app re-emits it
 * when the task is re-presented in a different language, carrying that locale.
 */
export type PostTaskStarted = IframeRpcMethod<{
  method: "postTaskStarted";
  caller: RpcCaller.App;
  parameters: {
    solution: Blob;
    locale: Language;
  };
  result: undefined;
}>;
