import ClassList from "./ClassList";
import { getClassesControllerFindAllResponseMock } from "@/api/collimator/generated/endpoints/classes/classes.msw";
import { backendHostName } from "@/utilities/constants";
import {
  getClassesControllerFindAllUrl,
  getClassesControllerRemoveUrl,
} from "@/api/collimator/generated/endpoints/classes/classes";

const classes = getClassesControllerFindAllResponseMock();

export default {
  component: ClassList,
  title: "ClassList",
  parameters: {
    mockData: [
      {
        url: `${backendHostName}${getClassesControllerFindAllUrl()}`,
        method: "GET",
        status: 200,
        response: classes,
      },

      ...classes.map((klass) => ({
        url: `${backendHostName}${getClassesControllerRemoveUrl(klass.id)}`,
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
