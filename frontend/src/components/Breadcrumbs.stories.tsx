import BreadcrumbItem from "./BreadcrumbItem";
import Breadcrumbs from "./Breadcrumbs";

type Args = Parameters<typeof Breadcrumbs>[0];

export default {
  component: Breadcrumbs,
  title: "Breadcrumbs",
  render: (args: Args) => (
    <Breadcrumbs {...args}>
      <BreadcrumbItem href="#">Users</BreadcrumbItem>
      <BreadcrumbItem href="#">John</BreadcrumbItem>
      <BreadcrumbItem href="#">Details</BreadcrumbItem>
      <BreadcrumbItem href="#">Edit</BreadcrumbItem>
    </Breadcrumbs>
  ),
};

export const Default = {
  args: {
    homeHref: "/",
  } as Omit<Args, "children">,
};
