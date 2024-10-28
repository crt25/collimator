import { fn } from "@storybook/test";
import CreateSessionForm, { SessionFormRef } from "./CreateSessionForm";
import SubmitFormButton from "../form/SubmitFormButton";
import { useRef } from "@storybook/preview-api";

type Args = Parameters<typeof CreateSessionForm>[0];

export default {
  component: CreateSessionForm,
  title: "CreateSessionForm",
  render: (args: Args) => {
    const ref = useRef<SessionFormRef | null>(null);
    return (
      <>
        <CreateSessionForm {...args} ref={ref} />
        <SubmitFormButton
          label={{ id: "_", defaultMessage: "Submit" }}
          onClick={() => ref.current?.triggerSubmit()}
        />
      </>
    );
  },
};

const lessonOptions = [
  { value: 1, label: "Lesson 1" },
  { value: 2, label: "Lesson 2" },
  { value: 3, label: "Lesson 3" },
];

export const Default = {
  args: {
    onSubmit: fn(),
    lessonOptions,
  } as Args,
};
