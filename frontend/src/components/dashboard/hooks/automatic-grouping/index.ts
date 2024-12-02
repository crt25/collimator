import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import { AutomaticGroupingType } from "./grouping-type";
import { match } from "ts-pattern";
import { agglomerativeClustering } from "./agglomerative-clustering";
import { DistanceType } from "../ast-distance/distance-type";
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
