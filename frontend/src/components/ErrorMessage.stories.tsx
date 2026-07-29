import { NetworkError } from "@/errors/api";
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

export const WhenTheServerIsUnreachable = {
  args: {
    error: new NetworkError(new TypeError("Failed to fetch")),
  } as Args,
};
