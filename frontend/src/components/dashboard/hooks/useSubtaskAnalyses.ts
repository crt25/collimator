import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import { useMemo } from "react";

export const useSubtaskAnalyses = (
  analyses: CurrentAnalysis[] | undefined,
  subTaskId: string | undefined,
): CurrentAnalysis[] | undefined =>
  useMemo(
    () =>
      analyses?.map((analysis) =>
        subTaskId !== undefined
          ? CurrentAnalysis.selectComponent(analysis, subTaskId)
          : analysis,
      ),
    [analyses, subTaskId],
  );
