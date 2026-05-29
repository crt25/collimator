import { HStack, Icon, Tag } from "@chakra-ui/react";
import { LuStar, LuStarOff } from "react-icons/lu";
import { FormattedMessage } from "react-intl";
import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import { CurrentStudentAnalysis } from "@/api/collimator/models/solutions/current-student-analysis";
import { useStarAnalysis } from "@/api/collimator/hooks/solutions/useStarAnalysis";

const StarAnalysisButton = ({
  classId,
  analysis,
  testId,
}: {
  classId: number;
  analysis: CurrentAnalysis;
  testId?: string;
}) => {
  const starAnalysis = useStarAnalysis();

  if (!(analysis instanceof CurrentStudentAnalysis)) {
    return null;
  }

  return (
    <Tag.Root
      size="lg"
      as="button"
      cursor="pointer"
      onClick={() =>
        starAnalysis(classId, analysis, !analysis.isReferenceSolution)
      }
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
