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

  return [
    state.orderIndexByTaskAndSolutionId[taskId] || {},
    (newState: ShowcaseOrderBySolutionId): void =>
      setState({
        orderIndexByTaskAndSolutionId: {
          ...state.orderIndexByTaskAndSolutionId,
          [taskId]: newState,
        },
      }),
  ];
};
