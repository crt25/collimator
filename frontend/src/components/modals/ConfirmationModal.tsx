import { Button, Modal } from "react-bootstrap";
import { MessageDescriptor, useIntl } from "react-intl";
import { ModalMessages } from "@/i18n/modal-messages";

const ConfirmationModal = ({
  isShown,
  setisShown,
  onConfirm,
  isDangerous,
  messages,
}: {
  isShown: boolean;
  setisShown: (isShown: boolean) => void;
  onConfirm: () => void;
  isDangerous?: boolean;
  messages: {
    title: MessageDescriptor;
    body: MessageDescriptor;
    confirmButton: MessageDescriptor;
  };
}) => {
  const intl = useIntl();

  return (
    <Modal show={isShown} onHide={() => setisShown(false)}>
      <Modal.Header closeButton>
        <Modal.Title>{intl.formatMessage(messages.title)}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{intl.formatMessage(messages.body)}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => setisShown(false)} variant="secondary">
          {intl.formatMessage(ModalMessages.cancel)}
        </Button>
        <Button
          onClick={() => {
            onConfirm();
            setisShown(false);
          }}
          variant={isDangerous ? "danger" : "primary"}
        >
          {intl.formatMessage(messages.confirmButton)}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;
