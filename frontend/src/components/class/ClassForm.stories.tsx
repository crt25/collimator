import { fn } from "@storybook/test";
import ClassForm from "./ClassForm";
import { getUsersControllerFindAllV0Url } from "@/api/collimator/generated/endpoints/users/users";
import { backendHostName } from "@/utilities/constants";
import { getUsersControllerFindAllV0ResponseMock } from "@/api/collimator/generated/endpoints/users/users.msw";

type Args = Parameters<typeof ClassForm>[0];

const users = getUsersControllerFindAllV0ResponseMock();

export default {
  component: ClassForm,
  title: "ClassForm",
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
      name: "Class 1",
      teacherId: users[0].id,
    },
  } as Args,
};
