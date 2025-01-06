import { useCallback } from "react";
import { ExistingSession } from "../../models/sessions/existing-session";
import { sessionsControllerCreateV0 } from "../../generated/endpoints/sessions/sessions";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { CreateSessionDto } from "../../generated/models";
import { useRevalidateClassSessionList } from "./useRevalidateClassSessionList";

type CreateSessionType = (
  classId: number,
  createSessionDto: CreateSessionDto,
) => Promise<ExistingSession>;

const createAndTransform = (
  options: RequestInit,
  classId: number,
  createSessionDto: CreateSessionDto,
): ReturnType<CreateSessionType> =>
  sessionsControllerCreateV0(classId, createSessionDto, options).then(
    ExistingSession.fromDto,
  );

export const useCreateSession = (): CreateSessionType => {
  const revalidateList = useRevalidateClassSessionList();
  const authOptions = useAuthenticationOptions();

  return useCallback<CreateSessionType>(
    (classId, createSessionDto) =>
      createAndTransform(authOptions, classId, createSessionDto).then(
        (result) => {
          revalidateList(classId);

          return result;
        },
      ),
    [authOptions, revalidateList],
  );
};
