import { getClassesControllerFindAllV0ResponseMock } from "@/api/collimator/generated/endpoints/classes/classes.msw";
import { backendHostName } from "@/utilities/constants";
import {
  getClassesControllerFindAllV0Url,
  getClassesControllerRemoveV0Url,
} from "@/api/collimator/generated/endpoints/classes/classes";
import ClassList from "./ClassList";

const classes = getClassesControllerFindAllV0ResponseMock();

export default {
  component: ClassList,
  title: "ClassList",
  parameters: {
    mockData: [
      {
        url: `${backendHostName}${getClassesControllerFindAllV0Url()}`,
        method: "GET",
        status: 200,
        response: classes,
      },

      ...classes.map((klass) => ({
        url: `${backendHostName}${getClassesControllerRemoveV0Url(klass.id)}`,
        method: "DELETE",
        status: 200,
        response: () => {
          classes.splice(classes.indexOf(klass), 1);
          return klass;
        },
      })),
    ],
  },
};

export const Default = {};
