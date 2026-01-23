import { NoCallbacksConnectedError } from "../errors";
import { ExecutionScheduledCallback } from "../../auto-save/task-auto-saver";

export const getCallbacksFromMockConnection = (
  connection: ExecutionScheduledCallback,
): CallableFunction[] => {
  const connectCall = jest.mocked(connection).mock.calls.filter((call) => {
    return typeof call[0] === "function";
  });

  if (connectCall.length === 0) {
    // no callbacks found
    throw new NoCallbacksConnectedError();
  }

  // return filtered callbacks
  return connectCall.map((call) => call[0]);
};
