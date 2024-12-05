import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import { getAstDistance } from "../ast-distance";
import { DistanceType } from "../ast-distance/distance-type";
import { SolutionGroup } from "./types";

interface SolutionGroupWithIndexes extends SolutionGroup {
  index: number;
  solutions: (CurrentAnalysis & { index: number })[];
}

const meanDistance = (
  a: SolutionGroupWithIndexes,
  b: SolutionGroupWithIndexes,
  solutionDistanceMap: number[][],
): number => {
  let sum = 0;

  for (const solutionA of a.solutions) {
    for (const solutionB of b.solutions) {
      sum += solutionDistanceMap[solutionA.index][solutionB.index];
    }
  }

  return sum / (a.solutions.length * b.solutions.length);
};

const computeGroupDistance = (
  a: SolutionGroupWithIndexes,
  b: SolutionGroupWithIndexes,
  groupDistanceMap: number[][],
  solutionDistanceMap: number[][],
): number => {
  if (groupDistanceMap[a.index][b.index] !== Number.POSITIVE_INFINITY) {
    return groupDistanceMap[a.index][b.index];
  }

  let distance: number;

  if (a.index === b.index) {
    distance = 0;
  } else {
    distance = meanDistance(a, b, solutionDistanceMap);
  }

  // memoize the distance
  groupDistanceMap[a.index][b.index] = distance;
  groupDistanceMap[b.index][a.index] = distance;

  return distance;
};

export const agglomerativeClustering = async (
  solutions: CurrentAnalysis[],
  numberOfGroups: number,
  distanceType: DistanceType,
): Promise<SolutionGroup[]> => {
  const sols = solutions.map((solution, index) => ({ ...solution, index }));
  // compute the distances between all pairs of solutions
  const solutionDistances = new Array(sols.length).fill(
    new Array(sols.length).fill(Number.POSITIVE_INFINITY),
  );
  const promises: Promise<unknown>[] = [];

  // precompute all distances - will be memoized
  for (let i = 0; i < solutions.length; i++) {
    for (let j = i + 1; j < solutions.length; j++) {
      promises.push(
        getAstDistance(
          distanceType,
          solutions[i].generalAst,
          solutions[j].generalAst,
        ).then((distance) => {
          solutionDistances[i][j] = distance;
          solutionDistances[j][i] = distance;
        }),
      );
    }
  }

  await Promise.all(promises);

  // initialize the groups with each solution in its own group
  const groups = new Set<SolutionGroupWithIndexes>(
    sols.map((solution) => ({
      index: solution.index,
      solutions: [solution],
    })),
  );

  // create a distance map for the groups. initially, the distances are the distances between the solutions
  const groupDistances = [...solutionDistances.map((s) => [...s])];

  while (groups.size > numberOfGroups) {
    let minDistance = Number.POSITIVE_INFINITY;
    let minDistanceG1: SolutionGroupWithIndexes | null = null;
    let minDistanceG2: SolutionGroupWithIndexes | null = null;

    // iterate all combinations. note that we memoize the distances between groups
    // meaning the overhead of computing some extra distances (since it is not trivial to iterate all pairs in a JS set)
    // is not big.
    for (const g1 of groups) {
      for (const g2 of groups) {
        if (g1 === g2) {
          continue;
        }

        const distance = computeGroupDistance(
          g1,
          g2,
          groupDistances,
          solutionDistances,
        );

        if (distance < minDistance) {
          minDistance = distance;
          minDistanceG1 = g1;
          minDistanceG2 = g2;
        }
      }
    }

    if (minDistanceG1 === null || minDistanceG2 === null) {
      break;
    }

    // merge the two groups with the smallest distance (g1 and g2)
    groups.delete(minDistanceG1);
    groups.delete(minDistanceG2);
    groups.add({
      index: minDistanceG1.index,
      solutions: [...minDistanceG1.solutions, ...minDistanceG2.solutions],
    });

    // delete the memoized distances between any group and the re-used group index.
    // use two loops for a better cache hit rate.
    for (let i = 0; i < groupDistances.length; i++) {
      groupDistances[i][minDistanceG1.index] = Number.POSITIVE_INFINITY;
    }
    for (let i = 0; i < groupDistances.length; i++) {
      groupDistances[minDistanceG1.index][i] = Number.POSITIVE_INFINITY;
    }
  }

  return [...groups];
};
