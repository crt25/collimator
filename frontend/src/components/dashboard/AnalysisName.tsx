import { FormattedMessage } from "react-intl";
import { HStack, Icon } from "@chakra-ui/react";
import { LuStar } from "react-icons/lu";
import { StudentName } from "../encryption/StudentName";
import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import { CurrentStudentAnalysis } from "@/api/collimator/models/solutions/current-student-analysis";
import { ReferenceAnalysis } from "@/api/collimator/models/solutions/reference-analysis";

const AnalysisPlainName = ({ analysis }: { analysis: CurrentAnalysis }) => {
  if (analysis instanceof CurrentStudentAnalysis) {
    return (
      <StudentName
        studentId={analysis.studentId}
        keyPairId={analysis.studentKeyPairId}
        pseudonym={analysis.studentPseudonym}
      />
    );
  }

  if (analysis instanceof ReferenceAnalysis) {
    if (analysis.isInitialTaskSolution) {
      return (
        <FormattedMessage
          id="AnalysisName.initialTaskSolution"
          defaultMessage="Initial task solution"
        />
      );
    }

    return analysis.title;
  }

  return (
    <FormattedMessage
      id="AnalysisName.unknownAnalysisType"
      defaultMessage="Unknown analysis type"
    />
  );
};

const AnalysisIcon = ({ analysis }: { analysis: CurrentAnalysis }) => {
  if (analysis instanceof CurrentStudentAnalysis) {
    if (analysis.isReferenceSolution) {
      return <LuStar />;
    }

    return null;
  }

  if (analysis instanceof ReferenceAnalysis) {
    if (analysis.isInitialTaskSolution) {
      return null;
    }

    return null;
  }

  return null;
};

const AnalysisName = ({
  analysis,
  withIcon,
}: {
  analysis: CurrentAnalysis;
  withIcon?: boolean;
}) => {
  return (
    <HStack>
      {withIcon && (
        <Icon>
          <AnalysisIcon analysis={analysis} />
        </Icon>
      )}
      <AnalysisPlainName analysis={analysis} />
    </HStack>
  );
};

export default AnalysisName;
