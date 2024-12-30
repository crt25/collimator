import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import { getAstDistance } from "./ast-distance";
import { DistanceType } from "./ast-distance/distance-type";
import { useEffect, useState } from "react";

/**
 * Computes all combinations of k elements from a set.
 * Inspired by https://github.com/lvlte/project-euler/blob/main/lib/combinatorics.js#L170
 * (MIT License).
 */
function* getCombinations(n: number, k: number): Generator<number[]> {
  const combinationSet: number[][] = [];

  if (k > n) {
    throw new Error("k must be less than or equal to n");
  }

  const combination = Array.from(Array(k), (_, idx) => idx);

  /**
   * Computes the next (n choose k) combination.
   * @returns False if we exhausted all combinations, true otherwise.
   */
  const next = (): boolean => {
    let i = k - 1;

    // combination is an array if k indices that will be sorted in ascending order.
    // we start by incrementing the last index.
    combination[i]++;

    if (combination[i] < n) {
      // if that index is still within bounds, we have a new combination.
      return true;
    }

    // if the last index is out of bounds (= n), we need to find the next index to increment.

    // define a limit for the next index to increment.
    // it will be decremented as we walk backwards through the combination
    // to ensure 1) that the indices are unique and 2) that they are strictly increasing (or decreasing backwards).
    let limit = n;

    // walk backwards from the last index to find the next index to increment.
    while (i > 0) {
      // we already did i, so decrement it.
      i--;
      // and accordingly decrement the limit.
      limit--;

      // then increment the next index.
      combination[i]++;

      // check if that value is below the limit. if it is, we found our now combination.
      // we just need to ensure that the indices are unique.
      if (combination[i] < limit) {
        // store the value of this index which is strictly smaller than n-i, i.e. at most n-i-1.
        let idx = combination[i];

        // walk until the end of the combination
        // and ensure that the indices are unique.
        for (let j = i + 1; j < combination.length; j++) {
          idx++;
          combination[j] = idx;
        }

        return true;
      }

      // if the value is not below the limit, we have incremented it to the limit in previous iterations
      // and need to continue walking backwards.
    }
    return false;
  };

  do {
    yield combination;
  } while (next());

  return combinationSet;
}

const getDissimilarAnalyses = async (
  analysesIn: CurrentAnalysis[] | undefined,
  numberOfAnalyses: number,
  distanceType: DistanceType = DistanceType.pq,
): Promise<CurrentAnalysis[] | undefined> => {
  if (!analysesIn) {
    return undefined;
  }

  if (analysesIn.length <= numberOfAnalyses || numberOfAnalyses < 2) {
    return [];
  }

  const analyses = analysesIn?.map((analysis, index) => ({
    ...analysis,
    index,
  }));

  const distances: number[][] = new Array(analyses.length).fill(
    new Array(analyses.length).fill(Number.POSITIVE_INFINITY),
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

  let maxDistance = 0;
  let bestCombination: number[] = new Array(numberOfAnalyses)
    .fill(0)
    .map((_, idx) => idx);

  // compute all combinations of k elements from the analysis set
  for (const combination of getCombinations(
    analyses.length,
    numberOfAnalyses,
  )) {
    let overallDistance = 0;
    // then, for each pair of analyses, add the distance
    for (const pair of getCombinations(combination.length, 2)) {
      const [i, j] = pair.map((index) => combination[index]);

      overallDistance += distances[i][j];
    }

    if (overallDistance >= maxDistance) {
      maxDistance = overallDistance;
      bestCombination = [...combination];
    }
  }

  return bestCombination.map((idx) => analyses[idx]);
};

export const useDissimilarAnalyses = (
  analysesIn: CurrentAnalysis[] | undefined,
  numberOfSolutions: number,
  distanceType: DistanceType = DistanceType.pq,
): CurrentAnalysis[] | undefined => {
  const [analyses, setAnalyses] = useState<CurrentAnalysis[] | undefined>(
    undefined,
  );

  useEffect(() => {
    let isCancelled = false;

    getDissimilarAnalyses(analysesIn, numberOfSolutions, distanceType).then(
      (analyses) => {
        if (isCancelled) {
          return;
        }

        setAnalyses(analyses);
      },
    );

    return (): void => {
      isCancelled = true;
    };
  }, [analysesIn, numberOfSolutions, distanceType]);

  return analyses;
};
