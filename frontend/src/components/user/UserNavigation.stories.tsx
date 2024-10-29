import Breadcrumbs from "../Breadcrumbs";
import UserNavigation from "./UserNavigation";

export default {
  component: UserNavigation,
  title: "UserNavigation",
};

type Args = Parameters<typeof UserNavigation>[0];

export const Default = {
  args: {
    userId: 1,
  } as Args,
};

const renderWithinBreadcrumbs = (args: Args) => (
  <Breadcrumbs>
    <UserNavigation {...args} />
  </Breadcrumbs>
);

export const AsBreadcrumb = {
  args: {
    userId: 1,
    breadcrumb: true,
  } as Args,
  render: renderWithinBreadcrumbs,
};
