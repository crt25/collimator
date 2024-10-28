import Breadcrumbs from "../Breadcrumbs";
import LessonNavigation from "./LessonNavigation";

export default {
  component: LessonNavigation,
  title: "LessonNavigation",
};

type Args = Parameters<typeof LessonNavigation>[0];

export const Default = {
  args: {
    lessonId: 1,
  } as Args,
};

const renderWithinBreadcrumbs = (args: Args) => (
  <Breadcrumbs>
    <LessonNavigation {...args} />
  </Breadcrumbs>
);

export const AsBreadcrumb = {
  args: {
    lessonId: 1,
    breadcrumb: true,
  } as Args,
  render: renderWithinBreadcrumbs,
};
