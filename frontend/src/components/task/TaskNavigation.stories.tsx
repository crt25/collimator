import Breadcrumbs from "../Breadcrumbs";
import TaskNavigation from "./TaskNavigation";

export default {
  component: TaskNavigation,
  title: "TaskNavigation",
};

type Args = Parameters<typeof TaskNavigation>[0];

export const Default = {
  args: {
    taskId: 1,
  } as Args,
};

const renderWithinBreadcrumbs = (args: Args) => (
  <Breadcrumbs>
    <TaskNavigation {...args} />
  </Breadcrumbs>
);

export const AsBreadcrumb = {
  args: {
    taskId: 1,
    breadcrumb: true,
  } as Args,
  render: renderWithinBreadcrumbs,
};

export const AsEmptyBreadcrumb = {
  args: {
    taskId: undefined,
    breadcrumb: true,
  } as Args,
  render: renderWithinBreadcrumbs,
};
