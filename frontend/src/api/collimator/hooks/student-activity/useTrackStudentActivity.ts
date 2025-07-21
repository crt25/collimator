import { useCallback } from "react";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { TrackStudentActivityDto } from "../../generated/models";
import { getStudentActivityControllerTrackV0Url } from "../../generated/endpoints/student-activity/student-activity";
import { fetchApi } from "@/api/fetch";

type TrackActivityType = (
  trackActivityDto: TrackStudentActivityDto,
) => Promise<void>;

export const studentActivityControllerTrack = async (
  trackStudentActivityDto: TrackStudentActivityDto,
  options?: RequestInit,
): Promise<void> => {
  const formData = new FormData();
  formData.append("type", trackStudentActivityDto.type);
  formData.append("sessionId", trackStudentActivityDto.sessionId.toString());
  formData.append("taskId", trackStudentActivityDto.taskId.toString());
  formData.append("solution", trackStudentActivityDto.solution);

  if (trackStudentActivityDto.appActivity !== null) {
    formData.append(
      "appActivity",
      JSON.stringify(trackStudentActivityDto.appActivity),
    );
  }

  return fetchApi<void>(getStudentActivityControllerTrackV0Url(), {
    ...options,
    method: "POST",
    body: formData,
  });
};

const createAndTransform = (
  options: RequestInit,
  trackActivityDto: TrackStudentActivityDto,
): ReturnType<TrackActivityType> =>
  studentActivityControllerTrack(trackActivityDto, options);

export const useTrackStudentActivity = (): TrackActivityType => {
  const authOptions = useAuthenticationOptions();

  return useCallback<TrackActivityType>(
    (trackActivityDto) => createAndTransform(authOptions, trackActivityDto),
    [authOptions],
  );
};
