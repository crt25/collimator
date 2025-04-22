import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import { DistanceType } from "../ast-distance/distance-type";
import { getAstDistance } from "../ast-distance";
import { AnalysisGroup } from "./types";

interface AnalysisGroupWithReference extends AnalysisGroup {
  reference: CurrentAnalysis;
}

const partitionAnalyses = (
  analyses: CurrentAnalysis[],
): {
  referenceSolutions: CurrentAnalysis[];
  nonReferenceSolutions: CurrentAnalysis[];
} => {
  const referenceSolutions: CurrentAnalysis[] = [];
  const nonReferenceSolutions: CurrentAnalysis[] = [];

  for (const analysis of analyses) {
    if (analysis.isReferenceSolution) {
      referenceSolutions.push(analysis);
    } else {
      nonReferenceSolutions.push(analysis);
    }
  }

  return {
    referenceSolutions,
    nonReferenceSolutions,
  };
};

export const referenceSolutionClustering = async (
  analyses: CurrentAnalysis[],
  distanceType: DistanceType,
): Promise<AnalysisGroup[]> => {
  // compute the distances between all pairs of solutions
  const { referenceSolutions, nonReferenceSolutions } =
    partitionAnalyses(analyses);

  if (referenceSolutions.length === 0) {
    // if there are no reference solutions, return a single group
    return [{ analyses }];
  }

  // create the groups based on the reference solutions
  const groups = referenceSolutions.map<AnalysisGroupWithReference>(
    (analysis) => ({
      reference: analysis,
      analyses: [analysis],
    }),
  );

  // for each non-reference solution, find the closest group and add it to that group
  const groupAssignments = await Promise.all(
    nonReferenceSolutions.map(async (analysis) => {
      const distances = await Promise.all(
        groups.map((group, groupIdx) =>
          getAstDistance(
            distanceType,
            analysis.generalAst,
            group.reference.generalAst,
          ).then((distance) => ({ distance, groupIdx })),
        ),
      );

      // find the group with the minimum distance
      const bestAssignment = distances.reduce((prev, curr) =>
        prev.distance < curr.distance ? prev : curr,
      );

      return {
        analysis,
        groupIdx: bestAssignment.groupIdx,
      };
    }),
  );

  for (const assignment of groupAssignments) {
    groups[assignment.groupIdx].analyses.push(assignment.analysis);
  }

  return groups;
};
