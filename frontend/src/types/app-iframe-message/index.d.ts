import { GetHeightRequest, GetHeightReponse } from "./get-height";
import { GetSubmissionRequest, GetSubmissionResponse } from "./get-submission";
import { GetTaskRequest, GetTaskResponse } from "./get-task";
import {
  LoadSubmissionRequest,
  LoadSubmissionResponse,
} from "./load-submission";
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
  | LoadSubmissionRequest
  | ReportProgressRequest;

export type AppIFrameResponse =
  | GetHeightReponse
  | GetSubmissionResponse
  | GetTaskResponse
  | LoadTaskResponse
  | LoadSubmissionResponse
  | ReportProgressReponse;

export type AppIFrameMessage = AppIFrameRequest | AppIFrameResponse;
