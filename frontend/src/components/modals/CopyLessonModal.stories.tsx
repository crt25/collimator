import { useState } from "storybook/preview-api";
import { backendHostName } from "@/utilities/constants";
import { getClassesControllerFindAllV0Url } from "@/api/collimator/generated/endpoints/classes/classes";
import { getClassesControllerFindAllV0ResponseMock } from "@/api/collimator/generated/endpoints/classes/classes.msw";
import {
  getSessionsControllerFindAllV0Url,
  getSessionsControllerCopyV0Url,
} from "@/api/collimator/generated/endpoints/sessions/sessions";
import {
  getSessionsControllerFindAllV0ResponseMock,
  getSessionsControllerCopyV0ResponseMock,
} from "@/api/collimator/generated/endpoints/sessions/sessions.msw";
import Button from "../Button";
import CopyLessonModal from "./CopyLessonModal";

type Args = Omit<Parameters<typeof CopyLessonModal>[0], "isOpen" | "onClose">;

const classes = getClassesControllerFindAllV0ResponseMock();
const sessionsMap: Record<
  number,
  ReturnType<typeof getSessionsControllerFindAllV0ResponseMock>
> = {};

classes.forEach((c) => {
  sessionsMap[c.id] = getSessionsControllerFindAllV0ResponseMock();
});

const meta = {
  component: CopyLessonModal,
  title: "CopyLessonModal",
  render: (args: Args) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <CopyLessonModal
          {...args}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      </>
    );
  },
  parameters: {
    mockData: [
      {
        url: `${backendHostName}${getClassesControllerFindAllV0Url()}`,
        method: "GET",
        status: 200,
        response: classes,
      },
      ...classes.map((c) => ({
        url: `${backendHostName}${getSessionsControllerFindAllV0Url(c.id)}`,
        method: "GET",
        status: 200,
        response: sessionsMap[c.id],
      })),
      ...classes.map((c) => ({
        url: `${backendHostName}${getSessionsControllerCopyV0Url(c.id)}`,
        method: "POST",
        status: 201,
        response: getSessionsControllerCopyV0ResponseMock(),
      })),
    ],
  },
};

export default meta;

export const Default = {
  args: {
    targetClassId: 1,
  } as Args,
};
