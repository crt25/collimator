import { defineMessages } from "react-intl";
import { LuFolderOpen, LuFile } from "react-icons/lu";
import { Breadcrumb } from "@chakra-ui/react";
import PageLayout from "./PageLayout";
import BreadcrumbItem from "@/components/BreadcrumbItem";

export default { component: PageLayout };

const messages = defineMessages({
  defaultTitle: {
    id: "PageLayout.defaultTitle",
    defaultMessage: "Page Title",
  },
  defaultHeading: {
    id: "PageLayout.defaultHeading",
    defaultMessage: "Page Heading",
  },
  withDescriptionTitle: {
    id: "PageLayout.withDescriptionTitle",
    defaultMessage: "Page with Description",
  },
  withDescriptionHeading: {
    id: "PageLayout.withDescriptionHeading",
    defaultMessage: "Welcome to the Page",
  },
});

type Args = Parameters<typeof PageLayout>[0];

export const Default = {
  args: {
    title: messages.defaultTitle,
    heading: messages.defaultHeading,
    children: <div>Page content goes here</div>,
  } as Args,
};

export const WithDescription = {
  args: {
    title: messages.withDescriptionTitle,
    heading: messages.withDescriptionHeading,
    description:
      "This is a description that provides context about the page content.",
    children: <div>Page content goes here</div>,
  } as Args,
};

export const WithBreadcrumbs = {
  args: {
    title: messages.defaultTitle,
    heading: messages.defaultHeading,
    breadcrumbs: (
      <>
        <BreadcrumbItem
          icon={<LuFolderOpen />}
          onClick={() => console.log("Home clicked")}
        >
          Home
        </BreadcrumbItem>
        <Breadcrumb.Separator />
        <BreadcrumbItem
          icon={<LuFolderOpen />}
          onClick={() => console.log("Section clicked")}
        >
          Section
        </BreadcrumbItem>
        <Breadcrumb.Separator />
        <BreadcrumbItem icon={<LuFile />}>Current Page</BreadcrumbItem>
      </>
    ),
    children: <div>Page content goes here</div>,
  } as Args,
};

export const Complete = {
  args: {
    title: messages.withDescriptionTitle,
    heading: messages.withDescriptionHeading,
    description:
      "This page has all features enabled including breadcrumbs and description.",
    breadcrumbs: (
      <>
        <BreadcrumbItem
          icon={<LuFolderOpen />}
          onClick={() => console.log("Home clicked")}
        >
          Home
        </BreadcrumbItem>
        <Breadcrumb.Separator />
        <BreadcrumbItem
          icon={<LuFolderOpen />}
          onClick={() => console.log("Section clicked")}
        >
          Section
        </BreadcrumbItem>
        <Breadcrumb.Separator />
        <BreadcrumbItem icon={<LuFile />}>Current Page</BreadcrumbItem>
      </>
    ),
    children: (
      <div>
        <p>Main page content with multiple elements</p>
        <p>Additional content here</p>
      </div>
    ),
  } as Args,
};
