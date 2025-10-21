import {
  CreatePipelineParams,
  DeletePipelineParams,
  MovePipelineParams,
  StudentAction,
} from "../../types/scratch-student-activities";

import {
  trackCreateActivity,
  trackMoveActivity,
  trackDeleteActivity,
} from "./index";

type StudentActivityPipelineParams =
  | CreatePipelineParams
  | MovePipelineParams
  | DeletePipelineParams;

export const processStudentActivityPipeline = (
  params: StudentActivityPipelineParams,
): void => {
  switch (params.action) {
    case StudentAction.Create:
      trackCreateActivity({
        block: params.block,
        sendRequest: params.sendRequest,
        solution: params.solution,
        event: params.event,
      });

      break;

    case StudentAction.Move:
      trackMoveActivity({
        block: params.block,
        sendRequest: params.sendRequest,
        solution: params.solution,
        event: params.event,
      });

      break;

    case StudentAction.Delete:
      trackDeleteActivity({
        block: params.block,
        sendRequest: params.sendRequest,
        solution: params.solution,
        event: params.event,
      });

      break;
  }
};
