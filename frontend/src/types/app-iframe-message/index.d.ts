import { GetHeightRequest, GetHeightReponse } from "./get-height";
import { GetSubmissionRequest, GetSubmissionResponse } from "./get-submission";
import { GetTaskRequest, GetTaskResponse } from "./get-task";
import { LoadTaskRequest, LoadTaskResponse } from "./load-task";

export type AppIFrameRequest =
  | GetHeightRequest
  | GetSubmissionRequest
  | GetTaskRequest
  | LoadTaskRequest;

export type AppIFrameResponse =
  | GetHeightReponse
  | GetSubmissionResponse
  | GetTaskResponse
  | LoadTaskResponse;

export type AppIFrameMessage = AppIFrameRequest | AppIFrameResponse;
