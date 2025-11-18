import { Button, Dialog, Icon, Portal, Text } from "@chakra-ui/react";
import { IoMdClose } from "react-icons/io";

interface ModalProps {
  title: string;
  description: string;
  warningText?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  onConfirm: () => void;
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
}

export const Modal = ({
  title,
  description,
  warningText,
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
  onConfirm,
  open,
  onOpenChange,
}: ModalProps) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange({ open: false });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} placement="center">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{title}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Text>{description}</Text>
              {warningText && <Text>{warningText}</Text>}
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="secondary">{cancelButtonText}</Button>
              </Dialog.ActionTrigger>
              <Button onClick={handleConfirm}>{confirmButtonText}</Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger>
              <Icon fontSize="2xl" margin="sm">
                <IoMdClose />
              </Icon>
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
