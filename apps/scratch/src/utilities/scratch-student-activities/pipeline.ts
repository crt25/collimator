import {
  CreatePipelineParams,
  DeletePipelineParams,
  MovePipelineParams,
  StudentActionType,
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
    case StudentActionType.Create:
      trackCreateActivity({
        block: params.block,
        sendRequest: params.sendRequest,
        solution: params.solution,
        event: params.event,
      });

      break;

    case StudentActionType.Move:
      trackMoveActivity({
        block: params.block,
        sendRequest: params.sendRequest,
        solution: params.solution,
        event: params.event,
      });

      break;

    case StudentActionType.Delete:
      trackDeleteActivity({
        block: params.block,
        sendRequest: params.sendRequest,
        solution: params.solution,
        event: params.event,
      });

      break;
  }
};
