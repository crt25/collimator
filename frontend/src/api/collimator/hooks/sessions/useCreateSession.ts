import { useCallback } from "react";
import { useRevalidateClassSessionList } from "./useRevalidateClassSessionList";
import { ExistingSession } from "../../models/sessions/existing-session";
import { sessionsControllerCreateV0 } from "../../generated/endpoints/sessions/sessions";

type Args = Parameters<typeof sessionsControllerCreateV0>;
type CreateSessionType = (...args: Args) => Promise<ExistingSession>;

const createAndTransform: CreateSessionType = (...args) =>
  sessionsControllerCreateV0(...args).then(ExistingSession.fromDto);

export const useCreateSession = (): CreateSessionType => {
  const revalidateList = useRevalidateClassSessionList();

  return useCallback(
    (...args: Args) =>
      createAndTransform(...args).then((result) => {
        const classId = args[0];

        revalidateList(classId);

        return result;
      }),
    [revalidateList],
  );
};
