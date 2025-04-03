import { useEffect, useState } from "react";
import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import { CurrentStudentAnalysis } from "@/api/collimator/models/solutions/current-student-analysis";
import { DistanceType } from "../ast-distance/distance-type";
import { getAstDistance } from "../ast-distance";

const getDissimilarPairs = async (
  analysesIn: CurrentAnalysis[] | undefined,
  numberOfPairs: number,
  distanceType: DistanceType,
): Promise<[CurrentStudentAnalysis, CurrentStudentAnalysis][] | undefined> => {
  if (!analysesIn) {
    return undefined;
  }

  if (numberOfPairs <= 0) {
    return [];
  }

  const analyses = analysesIn
    ?.filter((analysis) => analysis instanceof CurrentStudentAnalysis)
    .map((analysis, index) => ({
      analysis,
      index,
    }));

  const distances: {
    from: CurrentStudentAnalysis;
    to: CurrentStudentAnalysis;
    distance: number;
  }[] = [];
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
          if (distance > 0) {
            distances.push({
              from: analyses[i].analysis,
              to: analyses[j].analysis,
              distance,
            });
          }
        }),
      );
    }
  }

  await Promise.all(promises);

  const sortedEdgesDesc = distances.toSorted((a, b) => b.distance - a.distance);

  return sortedEdgesDesc
    .slice(0, numberOfPairs)
    .map((edge) => [edge.from, edge.to]);
};

export const useDissimilarPairs = (
  analysesIn: CurrentAnalysis[] | undefined,
  numberOfSolutions: number,
  distanceType: DistanceType = DistanceType.pqGrams,
): [CurrentStudentAnalysis, CurrentStudentAnalysis][] | undefined => {
  const [analyses, setAnalyses] = useState<
    [CurrentStudentAnalysis, CurrentStudentAnalysis][] | undefined
  >(undefined);

  useEffect(() => {
    let isCancelled = false;

    getDissimilarPairs(analysesIn, numberOfSolutions, distanceType).then(
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
