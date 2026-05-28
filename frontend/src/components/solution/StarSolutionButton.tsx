import { LuStar } from "react-icons/lu";
import { usePatchStudentSolutionIsReference } from "@/api/collimator/hooks/solutions/usePatchStudentSolutionIsReference";
import { usePatchStudentActivityIsReference } from "@/api/collimator/hooks/solutions/usePatchStudentActivityIsReference";
import { ExistingStudentSolution } from "@/api/collimator/models/solutions/existing-student-solutions";
import { CurrentStudentAnalysis } from "@/api/collimator/models/solutions/current-student-analysis";
import Button from "../Button";

type SolutionProps = {
  classId: number;
  solution: ExistingStudentSolution;
  testId?: string;
};

type AnalysisProps = {
  classId: number;
  analysis: CurrentStudentAnalysis;
  testId?: string;
};

type Props = SolutionProps | AnalysisProps;

const useToggleHandler = (
  props: Props,
  patchStudentSolutionIsReference: ReturnType<
    typeof usePatchStudentSolutionIsReference
  >,
  patchStudentActivityIsReference: ReturnType<
    typeof usePatchStudentActivityIsReference
  >,
) => {
  if ("solution" in props) {
    const { classId, solution } = props;
    return () =>
      patchStudentSolutionIsReference(
        classId,
        solution.sessionId,
        solution.taskId,
        solution.id,
        { isReference: !solution.isReference },
      );
  }

  const { classId, analysis } = props;

  if (analysis.isStudentSolution) {
    return () =>
      patchStudentSolutionIsReference(
        classId,
        analysis.sessionId,
        analysis.taskId,
        analysis.studentSolutionId!,
        { isReference: !analysis.isReferenceSolution },
      );
  }

  return () =>
    patchStudentActivityIsReference(
      classId,
      analysis.sessionId,
      analysis.taskId,
      analysis.studentId,
      { isReference: !analysis.isReferenceSolution },
    );
};

const StarSolutionButton = ({ testId, ...props }: Props) => {
  const patchStudentSolutionIsReference = usePatchStudentSolutionIsReference();
  const patchStudentActivityIsReference = usePatchStudentActivityIsReference();

  const isReference =
    "solution" in props
      ? props.solution.isReference
      : props.analysis.isReferenceSolution;

  const toggleIsReferenceSolution = useToggleHandler(
    props,
    patchStudentSolutionIsReference,
    patchStudentActivityIsReference,
  );

  return (
    <Button
      onClick={toggleIsReferenceSolution}
      colorPalette={isReference ? "yellow" : undefined}
      variant={isReference ? "solid" : "ghost"}
      data-testid={testId}
      padding="0"
    >
      <LuStar />
    </Button>
  );
};

export default StarSolutionButton;
