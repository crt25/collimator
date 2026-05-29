import { LuStar } from "react-icons/lu";
import { useStarAnalysis } from "@/api/collimator/hooks/solutions/useStarAnalysis";
import { CurrentStudentAnalysis } from "@/api/collimator/models/solutions/current-student-analysis";
import Button from "../Button";

const StarSolutionButton = ({
  classId,
  analysis,
  testId,
}: {
  classId: number;
  analysis: CurrentStudentAnalysis;
  testId?: string;
}) => {
  const starAnalysis = useStarAnalysis();

  return (
    <Button
      onClick={() =>
        starAnalysis(classId, analysis, !analysis.isReferenceSolution)
      }
      colorPalette={analysis.isReferenceSolution ? "yellow" : undefined}
      variant={analysis.isReferenceSolution ? "solid" : "ghost"}
      data-testid={testId}
      padding="0"
    >
      <LuStar />
    </Button>
  );
};

export default StarSolutionButton;
