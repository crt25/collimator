import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as faSolidStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStrokeStar } from "@fortawesome/free-regular-svg-icons";
import Button from "../Button";
import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import { CurrentStudentAnalysis } from "@/api/collimator/models/solutions/current-student-analysis";
import { usePatchStudentSolutionIsReference } from "@/api/collimator/hooks/solutions/usePatchStudentSolutionIsReference";

const StarAnalysisButton = ({
  classId,
  analysis,
  testId,
}: {
  classId: number;
  analysis: CurrentAnalysis;
  testId: string;
}) => {
  const patchStudentSolutionIsReference = usePatchStudentSolutionIsReference();

  const toggleIsReferenceSolution = () => {
    if (!(analysis instanceof CurrentStudentAnalysis)) {
      return;
    }

    patchStudentSolutionIsReference(
      classId,
      analysis.sessionId,
      analysis.taskId,
      analysis.studentSolutionId,
      {
        isReference: !analysis.isReferenceSolution,
      },
    );
  };

  if (!(analysis instanceof CurrentStudentAnalysis)) {
    return (
      <Button disabled data-testid={testId}>
        <FontAwesomeIcon icon={faSolidStar} />
      </Button>
    );
  }

  return (
    <Button onClick={toggleIsReferenceSolution} data-testid={testId}>
      <FontAwesomeIcon
        icon={analysis.isReferenceSolution ? faSolidStar : faStrokeStar}
      />
    </Button>
  );
};

export default StarAnalysisButton;
