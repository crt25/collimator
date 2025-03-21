import { match } from "ts-pattern";
import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import { DistanceType } from "../ast-distance/distance-type";
import { AutomaticGroupingType } from "./grouping-type";
import { agglomerativeClustering } from "./agglomerative-clustering";
import { AnalysisGroup } from "./types";

export const getAutomaticGroups = (
  solutions: CurrentAnalysis[],
  numberOfGroups: number,
  groupingType: AutomaticGroupingType,
  distanceType: DistanceType,
): Promise<AnalysisGroup[]> =>
  match(groupingType)
    .returnType<Promise<AnalysisGroup[]>>()
    .with(AutomaticGroupingType.agglomerativeClustering, () =>
      agglomerativeClustering(solutions, numberOfGroups, distanceType),
    )
    .exhaustive();
