import { GetHeightRequest, GetHeightReponse } from "./get-height";
import { GetSubmissionRequest, GetSubmissionResponse } from "./get-submission";
import { GetTaskRequest, GetTaskResponse } from "./get-task";
import {
  LoadSubmissionRequest,
  LoadSubmissionResponse,
} from "./load-submission";
import { LoadTaskRequest, LoadTaskResponse } from "./load-task";

export type AppIFrameRequest =
  | GetHeightRequest
  | GetSubmissionRequest
  | GetTaskRequest
  | LoadTaskRequest
  | LoadSubmissionRequest;

export type AppIFrameResponse =
  | GetHeightReponse
  | GetSubmissionResponse
  | GetTaskResponse
  | LoadTaskResponse
  | LoadSubmissionResponse;

export type AppIFrameMessage = AppIFrameRequest | AppIFrameResponse;
