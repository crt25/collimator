import { useMemo } from "react";
import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";

export const useSubtasks = (
  analyses: CurrentAnalysis[] | undefined,
): string[] =>
  useMemo(() => {
    if (!analyses) {
      return [];
    }

    return [
      ...analyses
        .map((s) => CurrentAnalysis.findComponentIds(s))
        .reduce((acc, x) => acc.union(x), new Set<string>()),
    ];
  }, [analyses]);
