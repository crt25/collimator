import { GetTask, Task } from "iframe-rpc-react/src";

export const getTask = async (
  getTaskFn: (request: GetTask["request"]) => Promise<Task>,
  requestId: number,
): Promise<Task> => {
  return await getTaskFn({
    jsonrpc: "2.0",
    method: "getTask",
    params: undefined,
    id: requestId,
  });
};
