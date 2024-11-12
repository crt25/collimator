import { useCallback } from "react";
import { useRevalidateClassSessionList } from "./useRevalidateClassSessionList";
import { sessionsControllerRemoveV0 } from "../../generated/endpoints/sessions/sessions";
import { DeletedSession } from "../../models/sessions/deleted-session";

type Args = Parameters<typeof sessionsControllerRemoveV0>;
type DeleteClassSessionType = (...args: Args) => Promise<DeletedSession>;

const fetchAndTransform: DeleteClassSessionType = (...args) =>
  sessionsControllerRemoveV0(...args).then(DeletedSession.fromDto);

export const useDeleteClassSession = (): DeleteClassSessionType => {
  const revalidateList = useRevalidateClassSessionList();

  return useCallback(
    (...args: Args) =>
      fetchAndTransform(...args).then((result) => {
        const classId = args[0];
        revalidateList(classId);

        return result;
      }),
    [revalidateList],
  );
};
