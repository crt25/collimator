import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import { getAstDistance } from "./ast-distance";
import { DistanceType } from "./ast-distance/distance-type";
import { useEffect, useState } from "react";

const getDissimilarAnalyses = async (
  analysesIn: CurrentAnalysis[] | undefined,
  numberOfAnalyses: number,
  distanceType: DistanceType = DistanceType.pq,
): Promise<[CurrentAnalysis, CurrentAnalysis][] | undefined> => {
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

  const distances: {
    from: CurrentAnalysis;
    to: CurrentAnalysis;
    distance: number;
  }[] = [];
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
          distances.push({
            from: analyses[i],
            to: analyses[j],
            distance,
          });
        }),
      );
    }
  }

  await Promise.all(promises);

  const sortedEdgesDesc = distances.toSorted((a, b) => b.distance - a.distance);

  return sortedEdgesDesc
    .slice(0, numberOfAnalyses)
    .map((edge) => [edge.from, edge.to]);
};

export const useDissimilarAnalyses = (
  analysesIn: CurrentAnalysis[] | undefined,
  numberOfSolutions: number,
  distanceType: DistanceType = DistanceType.pq,
): [CurrentAnalysis, CurrentAnalysis][] | undefined => {
  const [analyses, setAnalyses] = useState<
    [CurrentAnalysis, CurrentAnalysis][] | undefined
  >(undefined);

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
