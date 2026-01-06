import { HStack, Icon, Tag } from "@chakra-ui/react";
import { LuStar, LuStarOff } from "react-icons/lu";
import { FormattedMessage } from "react-intl";
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
  testId?: string;
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
    return null;
  }

  return (
    <Tag.Root
      size="lg"
      as="button"
      cursor="pointer"
      onClick={toggleIsReferenceSolution}
      colorPalette="yellow"
      data-testid={testId}
    >
      <Tag.Label>
        <HStack>
          <Icon>
            {analysis.isReferenceSolution ? <LuStarOff /> : <LuStar />}
          </Icon>
          {analysis.isReferenceSolution ? (
            <FormattedMessage
              id="CodeComparison.removeFromShowcase"
              defaultMessage="Remove from showcase"
            />
          ) : (
            <FormattedMessage
              id="CodeComparison.addToShowcase"
              defaultMessage="Add to showcase"
            />
          )}
        </HStack>
      </Tag.Label>
    </Tag.Root>
  );
};

export default StarAnalysisButton;
