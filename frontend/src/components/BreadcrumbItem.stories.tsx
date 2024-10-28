import BreadcrumbItem from "./BreadcrumbItem";
import Breadcrumbs from "./Breadcrumbs";

type Args = Parameters<typeof BreadcrumbItem>[0];

export default {
  component: BreadcrumbItem,
  title: "BreadcrumbItem",
  render: (args: Args) => (
    <Breadcrumbs>
      <BreadcrumbItem {...args} />
    </Breadcrumbs>
  ),
};

export const Default = {
  args: {
    href: "/",
    children: "Some string content",
  } as Args,
};
