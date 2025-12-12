import { MessageDescriptor, useIntl } from "react-intl";
import { Dialog, Portal } from "@chakra-ui/react";
import { ModalMessages } from "@/i18n/modal-messages";
import Button from "../Button";

const ConfirmationModal = ({
  isShown,
  setIsShown,
  onConfirm,
  isDangerous,
  messages,
}: {
  isShown: boolean;
  setIsShown: (isShown: boolean) => void;
  onConfirm?: () => void;
  isDangerous?: boolean;
  messages: {
    title: MessageDescriptor;
    body: MessageDescriptor;
    confirmButton: MessageDescriptor;
  };
}) => {
  const intl = useIntl();

  return (
    <Dialog.Root open={isShown} onOpenChange={() => setIsShown(false)}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content data-testid="confirmation-modal">
            <Dialog.Header>
              <Dialog.Title>{intl.formatMessage(messages.title)}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <p>{intl.formatMessage(messages.body)}</p>
            </Dialog.Body>
            <Dialog.Footer>
              <Button
                onClick={() => setIsShown(false)}
                variant="secondary"
                data-testid="cancel-button"
              >
                {intl.formatMessage(ModalMessages.cancel)}
              </Button>
              <Button
                onClick={() => {
                  if (onConfirm) {
                    onConfirm();
                  }

                  setIsShown(false);
                }}
                variant={isDangerous ? "danger" : "primary"}
                data-testid="confirm-button"
              >
                {intl.formatMessage(messages.confirmButton)}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default ConfirmationModal;
