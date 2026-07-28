import { useCallback } from "react";
import { CurrentStudentAnalysis } from "../../models/solutions/current-student-analysis";
import { usePatchStudentReferenceSolution } from "./usePatchStudentReferenceSolution";

type StarAnalysisType = (
  classId: number,
  analysis: CurrentStudentAnalysis,
  isReference: boolean,
) => Promise<void>;

export const useStarAnalysis = (): StarAnalysisType => {
  const patchStudentReferenceSolution = usePatchStudentReferenceSolution();

  return useCallback<StarAnalysisType>(
    (classId, analysis, isReference) =>
      patchStudentReferenceSolution(
        classId,
        analysis.sessionId,
        analysis.taskId,
        analysis.studentId,
        analysis.solutionHash,
        isReference,
      ),
    [patchStudentReferenceSolution],
  );
};
