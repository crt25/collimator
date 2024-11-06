import { GetHeightRequest, GetHeightReponse } from "./get-height";
import { GetSubmissionRequest, GetSubmissionResponse } from "./get-submission";
import { GetTaskRequest, GetTaskResponse } from "./get-task";
import { LoadTaskRequest, LoadTaskResponse } from "./load-task";
import {
  ReportProgressReponse,
  ReportProgressRequest,
} from "./report-progress";

export type AppIFrameRequest =
  | GetHeightRequest
  | GetSubmissionRequest
  | GetTaskRequest
  | LoadTaskRequest
  | ReportProgressRequest;

export type AppIFrameResponse =
  | GetHeightReponse
  | GetSubmissionResponse
  | GetTaskResponse
  | LoadTaskResponse
  | ReportProgressReponse;

export type AppIFrameMessage = AppIFrameRequest | AppIFrameResponse;
