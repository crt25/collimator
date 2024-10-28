import PageHeader from "./PageHeader";

export default {
  component: PageHeader,
  title: "PageHeader",
};

export const Default = {
  args: {
    children: "Some string content",
  },
};

export const RichContent = {
  args: {
    children: (
      <>
        <u>hello</u> <strong>world</strong>
      </>
    ),
  },
};
