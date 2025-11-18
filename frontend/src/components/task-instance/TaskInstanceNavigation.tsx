import { defineMessages } from "react-intl";
import {
  LuBadgeCheck,
  LuChartColumnBig,
  LuChartColumnStacked,
  LuChartScatter,
  LuFilePenLine,
  LuSettings2,
} from "react-icons/lu";
import TabNavigation, { NavigationTab } from "../TabNavigation";
import { ClassStudent } from "@/api/collimator/models/classes/class-student";

const messages = defineMessages({
  taskDetailsTab: {
    id: "TaskInstanceNavigation.taskDetails",
    defaultMessage: "Task Details",
  },
  referenceSolutionsTab: {
    id: "TaskInstanceNavigation.referenceSolutions",
    defaultMessage: "Reference Solutions",
  },
  studentResultsTab: {
    id: "TaskInstanceNavigation.studentResults",
    defaultMessage: "Students' Results",
  },
  analysisTab: {
    id: "TaskInstanceNavigation.analysisTab",
    defaultMessage: "Analysis",
  },
  dissimilarSolutionsTab: {
    id: "TaskInstanceNavigation.dissimilarSolutionsTab",
    defaultMessage: "Dissimilar Solutions",
  },
  dissimilarPairsTab: {
    id: "TaskInstanceNavigation.dissimilarPairsTab",
    defaultMessage: "Dissimilar Pairs",
  },
});

const tabs: NavigationTab[] = [
  {
    url: "detail",
    title: (intl) => intl.formatMessage(messages.taskDetailsTab),
    icon: <LuSettings2 />,
    testId: "task-instance-details-tab",
  },
  {
    url: "reference-solutions",
    title: (intl) => intl.formatMessage(messages.referenceSolutionsTab),
    icon: <LuBadgeCheck />,
    testId: "task-instance-reference-solutions-tab",
  },
  {
    url: "progress",
    title: (intl) => intl.formatMessage(messages.studentResultsTab),
    icon: <LuFilePenLine />,
    testId: "task-instance-student-results-tab",
  },
  {
    url: "analysis",
    title: (intl) => intl.formatMessage(messages.analysisTab),
    icon: <LuChartScatter />,
    testId: "task-instance-analysis-tab",
  },
  {
    url: "dissimilar-solutions",
    title: (intl) => intl.formatMessage(messages.dissimilarSolutionsTab),
    icon: <LuChartColumnStacked />,
    testId: "task-instance-dissimilar-solutions-tab",
  },
  {
    url: "dissimilar-pairs",
    title: (intl) => intl.formatMessage(messages.dissimilarPairsTab),
    icon: <LuChartColumnBig />,
    testId: "task-instance-dissimilar-pairs-tab",
  },
];

const TaskInstanceNavigation = ({
  classId,
  sessionId,
  taskId,
  breadcrumb,
}: {
  classId?: number;
  sessionId?: number;
  taskId?: number;
  student?: ClassStudent;
  breadcrumb?: boolean;
}) => (
  <TabNavigation
    tabs={tabs}
    prefix={`/class/${classId}/session/${sessionId}/task/${taskId}/`}
    breadcrumb={breadcrumb}
  />
);

export default TaskInstanceNavigation;
