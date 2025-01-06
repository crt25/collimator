import { fn } from "@storybook/test";
import { useState } from "@storybook/preview-api";
import Button from "../Button";
import ConfirmationModal from "./ConfirmationModal";

type Args = Omit<
  Parameters<typeof ConfirmationModal>[0],
  "isShown" | "setIsShown"
>;

export default {
  component: ConfirmationModal,
  title: "ConfirmationModal",
  render: (args: Args) => {
    const [isShown, setIsShown] = useState(false);

    return (
      <>
        <Button onClick={() => setIsShown(true)}>Open Modal</Button>
        <ConfirmationModal
          {...args}
          isShown={isShown}
          setIsShown={setIsShown}
        />
      </>
    );
  },
};

export const Default = {
  args: {
    onConfirm: fn(),
    messages: {
      title: {
        id: "_",
        defaultMessage: "Confirmation Title",
      },
      body: {
        id: "_",
        defaultMessage: "Are you sure?",
      },
      confirmButton: {
        id: "_",
        defaultMessage: "Yes",
      },
    },
  } as Args,
};

export const Dangerous = {
  args: {
    onConfirm: fn(),
    isDangerous: true,
    messages: {
      title: {
        id: "_",
        defaultMessage: "Confirmation Title",
      },
      body: {
        id: "_",
        defaultMessage: "Are you sure you want to do this?",
      },
      confirmButton: {
        id: "_",
        defaultMessage: "Yes",
      },
    },
  } as Args,
};
