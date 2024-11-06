import ErrorMessage from "./ErrorMessage";

type Args = Parameters<typeof ErrorMessage>[0];

export default {
  component: ErrorMessage,
  title: "ErrorMessage",
};

export const Default = {
  args: {
    error: new Error("An error occurred"),
  } as Args,
};
