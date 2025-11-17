import { Button, Dialog, Portal, Text, chakra } from "@chakra-ui/react";
import { ButtonVariant } from "@/components/ui/recipes/buttons/Button.recipe";

interface ModalProps {
  title: string;
  description: string;
  warningText?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  onConfirm: () => void;
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
  variant?: "danger" | "primary";
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
  variant = "danger",
}: ModalProps) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange({ open: false });
  };

  const WarningText = chakra(Text, {
    base: {
      color: "fgTertiary",
    },
  });

  const DialogFooter = chakra(Dialog.Footer, {
    base: {
      gap: "md",
    },
  });

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

              {warningText && <WarningText>{warningText}</WarningText>}
            </Dialog.Body>

            <DialogFooter>
              <Dialog.ActionTrigger asChild>
                <Button variant={ButtonVariant.secondary}>
                  {cancelButtonText}
                </Button>
              </Dialog.ActionTrigger>
              <Button
                variant={
                  variant === "danger"
                    ? ButtonVariant.danger
                    : ButtonVariant.primary
                }
                onClick={handleConfirm}
              >
                {confirmButtonText}
              </Button>
            </DialogFooter>

            <Dialog.CloseTrigger asChild>
              <Button variant={ButtonVariant.secondary}></Button>
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
