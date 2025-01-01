import { fn } from "@storybook/test";
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

export const WithSucceedingPromise = {
  args: {
    children: "easy task taking 5s",
    onClick: fn(
      () =>
        new Promise<void>((resolve) => {
          setTimeout(resolve, 5 * 1000);
        }),
    ),
  },
};

export const WithFailingPromise = {
  args: {
    children: "impossible task taking 2s",
    onClick: fn(
      () =>
        new Promise((_, reject) => {
          setTimeout(reject, 2 * 1000);
        }),
    ),
  },
};

export const WithNeverReturningPromise = {
  args: {
    children: "what is the answer to life the universe and everything?",
    onClick: fn(() => new Promise(() => {})),
  },
};
