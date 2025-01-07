import { fn } from "@storybook/test";
import { backendHostName } from "@/utilities/constants";
import { getTasksControllerFindAllV0ResponseMock } from "@/api/collimator/generated/endpoints/tasks/tasks.msw";
import { getTasksControllerFindAllV0Url } from "@/api/collimator/generated/endpoints/tasks/tasks";
import SessionForm from "./SessionForm";

type Args = Parameters<typeof SessionForm>[0];

const tasks = getTasksControllerFindAllV0ResponseMock();

export default {
  component: SessionForm,
  title: "SessionForm",
  parameters: {
    mockData: [
      {
        url: `${backendHostName}${getTasksControllerFindAllV0Url()}`,
        method: "GET",
        status: 200,
        response: tasks,
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
      name: "The name",
    },
  } as Args,
};
