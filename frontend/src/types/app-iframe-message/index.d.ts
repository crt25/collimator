import { GetHeightRequest, GetHeightReponse } from "./get-height";
import { GetSubmissionRequest, GetSubmissionResponse } from "./get-submission";
import { GetTaskRequest, GetTaskResponse } from "./get-task";
import {
  LoadSubmissionRequest,
  LoadSubmissionResponse,
} from "./load-submission";
import { LoadTaskRequest, LoadTaskResponse } from "./load-task";
import { SetLocaleRequest, SetLocaleResponse } from "./set-locale";

export type AppIFrameRequest =
  | SetLocaleRequest
  | GetHeightRequest
  | GetSubmissionRequest
  | GetTaskRequest
  | LoadTaskRequest
  | LoadSubmissionRequest;

export type AppIFrameResponse =
  | SetLocaleResponse
  | GetHeightReponse
  | GetSubmissionResponse
  | GetTaskResponse
  | LoadTaskResponse
  | LoadSubmissionResponse;

export type AppIFrameMessage = AppIFrameRequest | AppIFrameResponse;
