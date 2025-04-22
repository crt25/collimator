import { match } from "ts-pattern";
import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import { DistanceType } from "../ast-distance/distance-type";
import { AutomaticGroupingType } from "./grouping-type";
import { referenceSolutionClustering } from "./reference-solution-clustering";
import { AnalysisGroup } from "./types";

export const getAutomaticGroups = (
  analyses: CurrentAnalysis[],
  groupingType: AutomaticGroupingType,
  distanceType: DistanceType,
): Promise<AnalysisGroup[]> =>
  match(groupingType)
    .returnType<Promise<AnalysisGroup[]>>()
    .with(AutomaticGroupingType.referenceSolutionClustering, () =>
      referenceSolutionClustering(analyses, distanceType),
    )
    .exhaustive();
