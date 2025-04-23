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
  const referenceGroups = referenceSolutions.map<AnalysisGroupWithReference>(
    (analysis) => ({
      reference: analysis,
      analyses: [analysis],
    }),
  );

  // for each non-reference solution, find the closest group and add it to that group
  const referenceAssignments = await Promise.all(
    nonReferenceSolutions.map(async (analysis) => {
      const referenceDistances = await Promise.all(
        referenceGroups.map((group, groupIdx) =>
          getAstDistance(
            distanceType,
            analysis.generalAst,
            group.reference.generalAst,
          ).then((distance) => ({ distance, referenceGroupIndex: groupIdx })),
        ),
      );

      // find the group with the minimum distance
      const bestReference = referenceDistances.reduce(
        (best, reference) =>
          best.distance < reference.distance ? best : reference,
        { distance: Number.POSITIVE_INFINITY, referenceGroupIndex: 0 },
      );

      return {
        analysis,
        referenceGroupIndex: bestReference.referenceGroupIndex,
      };
    }),
  );

  for (const referenceAssignment of referenceAssignments) {
    referenceGroups[referenceAssignment.referenceGroupIndex].analyses.push(
      referenceAssignment.analysis,
    );
  }

  return referenceGroups;
};
