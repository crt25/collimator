import { useCallback } from "react";
import { ExistingSession } from "../../models/sessions/existing-session";
import { sessionsControllerCopyV0 } from "../../generated/endpoints/sessions/sessions";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { CopySessionDto } from "../../generated/models";
import { useRevalidateClassSessionList } from "./useRevalidateClassSessionList";

type CopySessionType = (
  targetClassId: number,
  copySessionDto: CopySessionDto,
) => Promise<ExistingSession>;

const copyAndTransform = (
  options: RequestInit,
  targetClassId: number,
  copySessionDto: CopySessionDto,
): ReturnType<CopySessionType> =>
  sessionsControllerCopyV0(targetClassId, copySessionDto, options).then(
    ExistingSession.fromDto,
  );

export const useCopySession = (): CopySessionType => {
  const revalidateList = useRevalidateClassSessionList();
  const authOptions = useAuthenticationOptions();

  return useCallback<CopySessionType>(
    (targetClassId, copySessionDto) =>
      copyAndTransform(authOptions, targetClassId, copySessionDto).then(
        (result) => {
          revalidateList(targetClassId);

          return result;
        },
      ),
    [authOptions, revalidateList],
  );
};
