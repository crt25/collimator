import Breadcrumbs from "../Breadcrumbs";
import ClassNavigation from "./ClassNavigation";

export default {
  component: ClassNavigation,
  title: "ClassNavigation",
};

type Args = Parameters<typeof ClassNavigation>[0];

export const Default = {
  args: {
    classId: 1,
  } as Args,
};

const renderWithinBreadcrumbs = (args: Args) => (
  <Breadcrumbs>
    <ClassNavigation {...args} />
  </Breadcrumbs>
);

export const AsBreadcrumb = {
  args: {
    classId: 1,
    breadcrumb: true,
    userId: 1,
    sessionId: 1,
  } as Args,
  render: renderWithinBreadcrumbs,
};

export const AsEmptyBreadcrumb = {
  args: {
    classId: undefined,
    breadcrumb: true,
  } as Args,
  render: renderWithinBreadcrumbs,
};
