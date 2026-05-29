import { useCallback } from "react";
import { CurrentStudentAnalysis } from "../../models/solutions/current-student-analysis";
import { usePatchStudentSolutionIsReference } from "./usePatchStudentSolutionIsReference";
import { usePatchStudentActivityIsReference } from "./usePatchStudentActivityIsReference";

type StarAnalysisType = (
  classId: number,
  analysis: CurrentStudentAnalysis,
  isReference: boolean,
) => Promise<void>;

export const useStarAnalysis = (): StarAnalysisType => {
  const patchStudentSolutionIsReference = usePatchStudentSolutionIsReference();
  const patchStudentActivityIsReference = usePatchStudentActivityIsReference();

  return useCallback<StarAnalysisType>(
    (classId, analysis, isReference) => {
      if (analysis.isStudentSolution) {
        return patchStudentSolutionIsReference(
          classId,
          analysis.sessionId,
          analysis.taskId,
          analysis.studentSolutionId!,
          { isReference },
        );
      }

      return patchStudentActivityIsReference(
        classId,
        analysis.sessionId,
        analysis.taskId,
        analysis.studentId,
        analysis.solutionHash,
        isReference,
      );
    },
    [patchStudentSolutionIsReference, patchStudentActivityIsReference],
  );
};
