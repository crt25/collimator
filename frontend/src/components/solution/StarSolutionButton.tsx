import { LuStar } from "react-icons/lu";
import { usePatchStudentSolutionIsReference } from "@/api/collimator/hooks/solutions/usePatchStudentSolutionIsReference";
import { ExistingStudentSolution } from "@/api/collimator/models/solutions/existing-student-solutions";
import Button from "../Button";

const StarSolutionButton = ({
  classId,
  solution,
  testId,
}: {
  classId: number;
  solution: ExistingStudentSolution;
  testId?: string;
}) => {
  const patchStudentSolutionIsReference = usePatchStudentSolutionIsReference();

  const toggleIsReferenceSolution = () => {
    patchStudentSolutionIsReference(
      classId,
      solution.sessionId,
      solution.taskId,
      solution.id,
      {
        isReference: !solution.isReference,
      },
    );
  };

  return (
    <Button
      onClick={toggleIsReferenceSolution}
      colorPalette={solution.isReference ? "yellow" : undefined}
      variant={solution.isReference ? "solid" : "ghost"}
      data-testid={testId}
      padding="0"
    >
      <LuStar />
    </Button>
  );
};

export default StarSolutionButton;
