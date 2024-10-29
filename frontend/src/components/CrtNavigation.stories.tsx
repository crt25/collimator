import Breadcrumbs from "./Breadcrumbs";
import CrtNavigation from "./CrtNavigation";

export default {
  component: CrtNavigation,
  title: "CrtNavigation",
};

type Args = Parameters<typeof CrtNavigation>[0];

export const Default = {
  args: {
    userId: 1,
  } as Args,
};

const renderWithinBreadcrumbs = (args: Args) => (
  <Breadcrumbs>
    <CrtNavigation {...args} />
  </Breadcrumbs>
);

export const AsUserBreadcrumb = {
  args: {
    userId: 1,
    breadcrumb: true,
  } as Args,
  render: renderWithinBreadcrumbs,
};

export const AsClassBreadcrumb = {
  args: {
    classId: 1,
    breadcrumb: true,
  } as Args,
  render: renderWithinBreadcrumbs,
};

export const AsLessonBreadcrumb = {
  args: {
    lessonId: 1,
    breadcrumb: true,
  } as Args,
  render: renderWithinBreadcrumbs,
};
