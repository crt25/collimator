import { useCallback } from "react";
import { ExistingSession } from "../../models/sessions/existing-session";
import { sessionsControllerCopyV0 } from "../../generated/endpoints/sessions/sessions";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { useRevalidateClassSessionList } from "./useRevalidateClassSessionList";

type CopySessionType = (
  targetClassId: number,
  sourceSessionId: number,
) => Promise<ExistingSession>;

const copyAndTransform = (
  options: RequestInit,
  targetClassId: number,
  sourceSessionId: number,
): ReturnType<CopySessionType> =>
  sessionsControllerCopyV0(
    targetClassId,
    { sourceSessionId },
    { includeSoftDelete: false },
    options,
  ).then(ExistingSession.fromDto);
export const useCopySession = (): CopySessionType => {
  const revalidateList = useRevalidateClassSessionList();
  const authOptions = useAuthenticationOptions();

  return useCallback<CopySessionType>(
    (targetClassId, sourceSessionId) =>
      copyAndTransform(authOptions, targetClassId, sourceSessionId).then(
        (result) => {
          revalidateList(targetClassId);

          return result;
        },
      ),
    [authOptions, revalidateList],
  );
};
