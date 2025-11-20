import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";

type ShowcaseOrderBySolutionId = {
  [solutionId: string]: number;
};

type ShowcaseOrderByTasAndSolutionkId = {
  [taskId: number]: ShowcaseOrderBySolutionId;
};

type ShowcaseOrderState = {
  orderIndexByTaskAndSolutionId: ShowcaseOrderByTasAndSolutionkId;
};

export const useShowcaseOrder = (
  taskId: number,
): [ShowcaseOrderBySolutionId, (value: ShowcaseOrderBySolutionId) => void] => {
  const [state, setState] = useLocalStorage<ShowcaseOrderState>(
    "showcaseOrder",
    {
      orderIndexByTaskAndSolutionId: {},
    },
  );

  const taskState = useMemo(
    () => state.orderIndexByTaskAndSolutionId[taskId] || {},
    [state, taskId],
  );

  const setTaskState = useCallback(
    (newState: ShowcaseOrderBySolutionId): void =>
      setState({
        orderIndexByTaskAndSolutionId: {
          ...state.orderIndexByTaskAndSolutionId,
          [taskId]: newState,
        },
      }),
    [setState, state, taskId],
  );

  return [taskState, setTaskState];
};
