import { match } from "ts-pattern";
import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import { DistanceType } from "../ast-distance/distance-type";
import { AutomaticGroupingType } from "./grouping-type";
import { agglomerativeClustering } from "./agglomerative-clustering";
import { SolutionGroup } from "./types";

export const getAutomaticGroups = (
  solutions: CurrentAnalysis[],
  numberOfGroups: number,
  groupingType: AutomaticGroupingType,
  distanceType: DistanceType,
): Promise<SolutionGroup[]> =>
  match(groupingType)
    .returnType<Promise<SolutionGroup[]>>()
    .with(AutomaticGroupingType.agglomerativeClustering, () =>
      agglomerativeClustering(solutions, numberOfGroups, distanceType),
    )
    .exhaustive();
