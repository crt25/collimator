import { defineMessages } from "react-intl";
import TabNavigation, { NavigationTab } from "../TabNavigation";

const messages = defineMessages({
  lessonTab: {
    id: "LessonNavigation.lessonTab",
    defaultMessage: "Lesson Details",
  },
});

const tabs: NavigationTab[] = [
  {
    url: "detail",
    title: (intl) => intl.formatMessage(messages.lessonTab),
  },
];

const LessonNavigation = ({
  lessonId,
  breadcrumb,
}: {
  lessonId: number;
  breadcrumb?: boolean;
}) => (
  <TabNavigation
    tabs={tabs}
    prefix={`/lesson/${lessonId}/`}
    breadcrumb={breadcrumb}
  />
);

export default LessonNavigation;
