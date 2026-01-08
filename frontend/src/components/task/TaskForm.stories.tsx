import { fn } from "storybook/test";
import { getUsersControllerFindAllV0Url } from "@/api/collimator/generated/endpoints/users/users";
import { backendHostName } from "@/utilities/constants";
import { getUsersControllerFindAllV0ResponseMock } from "@/api/collimator/generated/endpoints/users/users.msw";
import TaskForm from "./TaskForm";

type Args = Parameters<typeof TaskForm>[0];

const users = getUsersControllerFindAllV0ResponseMock();

export default {
  component: TaskForm,
  title: "TaskForm",
  parameters: {
    mockData: [
      {
        url: `${backendHostName}${getUsersControllerFindAllV0Url()}`,
        method: "GET",
        status: 200,
        response: users,
      },
    ],
  },
};

export const Default = {
  args: {
    submitMessage: {
      id: "_",
      defaultMessage: "Submit",
    },
    onSubmit: fn(),
  } as Args,
};

export const WithCustomSubmitButton = {
  args: {
    submitMessage: {
      id: "_",
      defaultMessage: "Press me",
    },
    onSubmit: fn(),
  } as Args,
};

export const WithInitialValues = {
  args: {
    submitMessage: {
      id: "_",
      defaultMessage: "Press me",
    },
    onSubmit: fn(),
    initialValues: {
      title: "Introduction to Scratch",
      description:
        "This is a task to introduce you to Scratch.\nIt is a simple task to get you started.\n\nGood luck!",
      type: "SCRATCH",
    },
  } as Args,
};
