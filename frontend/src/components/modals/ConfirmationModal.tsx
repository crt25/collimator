import { Button, Modal } from "react-bootstrap";
import { MessageDescriptor, useIntl } from "react-intl";
import { ModalMessages } from "@/i18n/modal-messages";

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
    <Modal
      show={isShown}
      onHide={() => setIsShown(false)}
      data-testid="confirmation-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>{intl.formatMessage(messages.title)}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{intl.formatMessage(messages.body)}</p>
      </Modal.Body>
      <Modal.Footer>
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
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;
