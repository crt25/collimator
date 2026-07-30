import { useCallback } from "react";
import { CurrentStudentAnalysis } from "../../models/solutions/current-student-analysis";
import { usePatchStudentReferenceSolutions } from "./usePatchStudentReferenceSolutions";

type StarAnalysisType = (
  classId: number,
  analysis: CurrentStudentAnalysis,
  isReference: boolean,
) => Promise<void>;

export const useStarAnalysis = (): StarAnalysisType => {
  const patchStudentReferenceSolutions = usePatchStudentReferenceSolutions();

  return useCallback<StarAnalysisType>(
    (classId, analysis, isReference) =>
      patchStudentReferenceSolutions(
        classId,
        analysis.sessionId,
        analysis.taskId,
        analysis.studentId,
        [analysis.solutionHash],
        isReference,
      ),
    [patchStudentReferenceSolutions],
  );
};
