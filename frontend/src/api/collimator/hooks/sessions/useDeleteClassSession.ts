import { useCallback } from "react";
import { sessionsControllerRemoveV0 } from "../../generated/endpoints/sessions/sessions";
import { DeletedSession } from "../../models/sessions/deleted-session";
import { useAuthenticationOptions } from "../authentication/useAuthenticationOptions";
import { useRevalidateClassSessionList } from "./useRevalidateClassSessionList";

type DeleteClassSessionType = (
  classId: number,
  id: number,
) => Promise<DeletedSession>;

const fetchAndTransform = (
  options: RequestInit,
  classId: number,
  id: number,
): ReturnType<DeleteClassSessionType> =>
  sessionsControllerRemoveV0(classId, id, options).then(DeletedSession.fromDto);

export const useDeleteClassSession = (): DeleteClassSessionType => {
  const authOptions = useAuthenticationOptions();
  const revalidateList = useRevalidateClassSessionList();

  return useCallback<DeleteClassSessionType>(
    (classId, id) =>
      fetchAndTransform(authOptions, classId, id).then((result) => {
        revalidateList(classId);

        return result;
      }),
    [authOptions, revalidateList],
  );
};
