import Button from "./Button";

export default {
  component: Button,
  title: "Button",
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
