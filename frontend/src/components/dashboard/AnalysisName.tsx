import { FormattedMessage } from "react-intl";
import { StudentName } from "../encryption/StudentName";
import { CurrentAnalysis } from "@/api/collimator/models/solutions/current-analysis";
import { CurrentStudentAnalysis } from "@/api/collimator/models/solutions/current-student-analysis";
import { ReferenceAnalysis } from "@/api/collimator/models/solutions/reference-analysis";

const AnalysisName = ({ analysis }: { analysis: CurrentAnalysis }) => {
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

export default AnalysisName;
