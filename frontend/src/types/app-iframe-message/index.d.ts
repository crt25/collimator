import { GetHeightRequest, GetHeightReponse } from "./get-height";
import { GetSubmissionRequest, GetSubmissionResponse } from "./get-submission";

export type AppIFrameRequest = GetHeightRequest | GetSubmissionRequest;
export type AppIFrameResponse = GetHeightReponse | GetSubmissionResponse;

export type AppIFrameMessage = AppIFrameRequest | AppIFrameResponse;
