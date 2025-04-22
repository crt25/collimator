import { useEffect, useState } from "react";
import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import { CurrentStudentAnalysis } from "@/api/collimator/models/solutions/current-student-analysis";
import { getAstDistance } from "../ast-distance";
import { DistanceType } from "../ast-distance/distance-type";
import { choose, getCombinationsUnsafe } from "./combinatorics";

const logModule = `[useDissimilarAnalyses]`;

export class TooManyCombinationsError extends Error {
  constructor() {
    super(
      `${logModule} The number of combinations is too high. Please select a smaller number of analyses.`,
    );
  }
}

const computePairwiseDistance = async (
  analyses: CurrentAnalysis[],
  distanceType: DistanceType,
): Promise<number[][]> => {
  const distances: number[][] = new Array<undefined>(analyses.length)
    .fill(undefined)
    .map(() =>
      new Array<number>(analyses.length).fill(Number.POSITIVE_INFINITY),
    );

  const promises: Promise<unknown>[] = [];

  // precompute all distances - will be memoized
  for (let i = 0; i < analyses.length; i++) {
    for (let j = i + 1; j < analyses.length; j++) {
      promises.push(
        getAstDistance(
          distanceType,
          analyses[i].generalAst,
          analyses[j].generalAst,
        ).then((distance) => {
          distances[i][j] = distance;
          distances[j][i] = distance;
        }),
      );
    }
  }

  await Promise.all(promises);

  return distances;
};

const getBestCombination = (
  numberOfAnalyses: number,
  distances: number[][],
  initialDistance: number = 0,
  combineDistances: (overallDistance: number, distance: number) => number = (
    d1,
    d2,
  ) => d1 + d2,
  isNewDistanceBetter: (bestDistance: number, newDistance: number) => boolean,
): number[] => {
  let bestDistance = 0;
  // store the "best" combination in the form of indices of the analyses
  let bestCombination: number[] = new Array<number>(numberOfAnalyses)
    .fill(0)
    .map((_, idx) => idx);

  // compute all combinations of k elements from the analysis set
  for (const combination of getCombinationsUnsafe(
    distances.length,
    numberOfAnalyses,
  )) {
    let newDistance = initialDistance;
    // then, for each pair of analyses, add the distance
    for (const pair of getCombinationsUnsafe(combination.length, 2)) {
      const [i, j] = pair.map((index) => combination[index]);
      newDistance = combineDistances(newDistance, distances[i][j]);
    }

    if (isNewDistanceBetter(bestDistance, newDistance)) {
      bestDistance = newDistance;
      // store a copy of the combination with the maximum distance,
      // because getCombinationsUnsafe will otherwise override combination.
      bestCombination = [...combination];
    }
  }

  return bestCombination;
};

export const maximizeMinimumDistance = (
  numberOfAnalyses: number,
  distances: number[][],
): number[] =>
  getBestCombination(
    numberOfAnalyses,
    distances,
    // since we take the minimum distance, we need to start with the maximum possible value
    Number.POSITIVE_INFINITY,
    (d1, d2) => Math.min(d1, d2),
    // the new distance is better if it is greater than the best distance (maximizing)
    (bestDistance, newDistance) => bestDistance < newDistance,
  );

const getDissimilarAnalyses = async <T extends CurrentAnalysis>(
  analysesIn: T[] | undefined,
  numberOfAnalyses: number,
  distanceType: DistanceType = DistanceType.pqGrams,
): Promise<T[] | undefined> => {
  if (!analysesIn) {
    return undefined;
  }

  if (analysesIn.length === numberOfAnalyses) {
    return analysesIn;
  }

  if (analysesIn.length < numberOfAnalyses) {
    return [];
  }

  const numberOfCombinations = choose(analysesIn.length, numberOfAnalyses);

  if (
    !Number.isFinite(numberOfCombinations) ||
    numberOfCombinations > 100_000
  ) {
    throw new TooManyCombinationsError();
  }

  const distances = await computePairwiseDistance(analysesIn, distanceType);

  const analyses = analysesIn.map((analysis, index) => ({
    analysis,
    index,
  }));

  return maximizeMinimumDistance(numberOfAnalyses, distances).map(
    (idx) => analyses[idx].analysis,
  );
};

export const useDissimilarAnalyses = (
  analysesIn: CurrentAnalysis[] | undefined,
  numberOfSolutions: number,
  distanceType: DistanceType = DistanceType.pqGrams,
): {
  tooManyCombinations: boolean;
  analyses: CurrentStudentAnalysis[] | undefined;
} => {
  const [tooManyCombinations, setTooManyCombinations] =
    useState<boolean>(false);

  const [analyses, setAnalyses] = useState<
    CurrentStudentAnalysis[] | undefined
  >(undefined);

  useEffect(() => {
    let isCancelled = false;

    getDissimilarAnalyses(
      analysesIn?.filter(
        (analysis) => analysis instanceof CurrentStudentAnalysis,
      ),
      numberOfSolutions,
      distanceType,
    )
      .then((analyses) => {
        if (isCancelled) {
          return;
        }

        setTooManyCombinations(false);
        setAnalyses(analyses);
      })
      .catch((e) => {
        if (isCancelled) {
          return;
        }

        if (e instanceof TooManyCombinationsError) {
          setTooManyCombinations(true);
        } else {
          throw e;
        }
      });

    return (): void => {
      isCancelled = true;
    };
  }, [analysesIn, numberOfSolutions, distanceType]);

  return { tooManyCombinations, analyses };
};
