import { useCallback, useEffect, useState } from "react";
import { fetchApi } from "@/api/fetch";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { TrackStudentActivityDto } from "../../generated/models";
import { getStudentActivityControllerTrackV0Url } from "../../generated/endpoints/student-activity/student-activity";

type ActivityDto = Omit<TrackStudentActivityDto, "happenedAt"> & {
  solution: Blob;
};
type ActivityDtoWithDate = ActivityDto & { happenedAt: Date };
type TrackActivityType = (trackActivityDto: ActivityDto) => Promise<void>;
type TrackActivityFailure = boolean;

let activitiesToTrack: ActivityDtoWithDate[] = [];

export const studentActivityControllerTrack = async (
  activities: ActivityDtoWithDate[],
  options?: RequestInit,
): Promise<void> => {
  const formData = new FormData();
  formData.append(
    "activities",
    JSON.stringify(
      activities.map(
        (activity) =>
          ({
            type: activity.type,
            taskId: activity.taskId,
            sessionId: activity.sessionId,
            appActivity: activity.appActivity,
            happenedAt: activity.happenedAt.toISOString(),
          }) satisfies TrackStudentActivityDto,
      ),
    ),
  );

  activities.forEach((activity) =>
    formData.append("solutions", activity.solution),
  );

  return fetchApi<void>(getStudentActivityControllerTrackV0Url(), {
    ...options,
    method: "POST",
    body: formData,
  });
};

export const useTrackStudentActivity = (): [
  TrackActivityType,
  TrackActivityFailure,
] => {
  const authOptions = useAuthenticationOptions();

  const [activityTrackingError, setActivityTrackingError] = useState(false);

  const trackActivity = useCallback(
    async (
      options: RequestInit,
      activities: ActivityDtoWithDate[],
    ): ReturnType<TrackActivityType> => {
      try {
        const result = await studentActivityControllerTrack(
          activities,
          options,
        );
        setActivityTrackingError(false);
        return result;
      } catch (error) {
        setActivityTrackingError(true);
        throw error;
      }
    },
    [],
  );

  useEffect(() => {
    // add event listener for when the application is online
    // and re-send the activities to track
    const handleOnline = async (): Promise<void> => {
      if (activitiesToTrack.length > 0) {
        // create a copy of the activities to track
        const activities = [...activitiesToTrack];

        try {
          activitiesToTrack = [];
          await trackActivity(authOptions, activities);
        } catch (error) {
          // if the request fails, restore the activities to track
          activitiesToTrack = activities;
          console.error("Failed to track student activities:", error);
        }
      }
    };

    window.addEventListener("online", handleOnline);

    // clean up the event listener on component unmount
    return (): void => window.removeEventListener("online", handleOnline);
  }, [authOptions, trackActivity]);

  return [
    useCallback<TrackActivityType>(
      async (newActivity) => {
        // create new array with activities that should be tracked
        const activities = [
          ...activitiesToTrack,
          { ...newActivity, happenedAt: new Date() },
        ];
        // clear the array to avoid duplicate tracking
        activitiesToTrack = [];

        try {
          return await trackActivity(authOptions, activities);
        } catch (error) {
          // on error, ensure the activities are tracked again the next time
          // we send a request by appending them
          activitiesToTrack = [...activitiesToTrack, ...activities];

          throw error;
        }
      },
      [authOptions, trackActivity],
    ),
    activityTrackingError,
  ];
};
