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

  const analyses = analysesIn?.map((analysis, index) => ({
    analysis,
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
          analyses[i].analysis.generalAst,
          analyses[j].analysis.generalAst,
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
  for (const combination of getCombinationsUnsafe(
    analyses.length,
    numberOfAnalyses,
  )) {
    let overallDistance = 0;
    // then, for each pair of analyses, add the distance
    for (const pair of getCombinationsUnsafe(combination.length, 2)) {
      const [i, j] = pair.map((index) => combination[index]);

      overallDistance += distances[i][j];
    }

    if (overallDistance > maxDistance) {
      maxDistance = overallDistance;
      // store a copy of the combination with the maximum distance,
      // because getCombinationsUnsafe will otherwise override combination.
      bestCombination = [...combination];
    }
  }

  return bestCombination.map((idx) => analyses[idx].analysis);
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

    getDissimilarAnalyses(analysesIn, numberOfSolutions, distanceType)
      .then((analyses) => {
        if (isCancelled) {
          return;
        }

        setTooManyCombinations(false);
        setAnalyses(
          analyses?.filter(
            (analysis) => analysis instanceof CurrentStudentAnalysis,
          ),
        );
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
