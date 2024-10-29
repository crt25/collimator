import Breadcrumbs from "../Breadcrumbs";
import SessionNavigation from "./SessionNavigation";

export default {
  component: SessionNavigation,
  title: "SessionNavigation",
};

type Args = Parameters<typeof SessionNavigation>[0];

export const Default = {
  args: {
    classId: 1,
    sessionId: 1,
  } as Args,
};

const renderWithinBreadcrumbs = (args: Args) => (
  <Breadcrumbs>
    <SessionNavigation {...args} />
  </Breadcrumbs>
);

export const AsBreadcrumb = {
  args: {
    classId: 1,
    sessionId: 1,
    userId: 1,
    breadcrumb: true,
  } as Args,
  render: renderWithinBreadcrumbs,
};

export const AsEmptyBreadcrumb = {
  args: {
    classId: 1,
    sessionId: 1,
    breadcrumb: true,
  } as Args,
  render: renderWithinBreadcrumbs,
};
