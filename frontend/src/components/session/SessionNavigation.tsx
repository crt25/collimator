import { defineMessages } from "react-intl";
import TabNavigation, { NavigationTab } from "../TabNavigation";
import BreadcrumbItem from "../BreadcrumbItem";
import { ClassStudent } from "@/api/collimator/models/classes/class-student";
import { StudentName } from "../encryption/StudentName";

const messages = defineMessages({
  progressTab: {
    id: "SessionNavigation.progress",
    defaultMessage: "Progress",
  },
  analysisTab: {
    id: "SessionNavigation.analysisTab",
    defaultMessage: "Analysis",
  },
  dissimilarSolutionsTab: {
    id: "SessionNavigation.dissimilarSolutionsTab",
    defaultMessage: "Dissimilar Solutions",
  },
  dissimilarPairsTab: {
    id: "SessionNavigation.dissimilarPairsTab",
    defaultMessage: "Dissimilar Pairs",
  },
});

const tabs: NavigationTab[] = [
  {
    url: "progress",
    title: (intl) => intl.formatMessage(messages.progressTab),
  },
  {
    url: "analysis",
    title: (intl) => intl.formatMessage(messages.analysisTab),
  },
  {
    url: "dissimilar-solutions",
    title: (intl) => intl.formatMessage(messages.dissimilarSolutionsTab),
  },
  {
    url: "dissimilar-pairs",
    title: (intl) => intl.formatMessage(messages.dissimilarPairsTab),
  },
];

const SessionNavigation = ({
  classId,
  sessionId,
  student,
  breadcrumb,
}: {
  classId?: number;
  sessionId?: number;
  student?: ClassStudent;
  breadcrumb?: boolean;
}) => (
  <>
    <TabNavigation
      tabs={tabs}
      prefix={`/class/${classId}/session/${sessionId}/`}
      breadcrumb={breadcrumb}
    />
    {breadcrumb && student && (
      <BreadcrumbItem>
        <StudentName
          pseudonym={student.pseudonym}
          keyPairId={student.keyPairId}
        />
      </BreadcrumbItem>
    )}
  </>
);

export default SessionNavigation;
