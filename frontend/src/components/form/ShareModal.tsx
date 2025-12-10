import {
  Dialog,
  Icon,
  InputGroup,
  Input,
  Clipboard,
  IconButton,
  Portal,
  Text,
} from "@chakra-ui/react";
import { JSX } from "react";
import { IoMdClose } from "react-icons/io";
import { LuClipboardCopy } from "react-icons/lu";

interface ShareModalProps {
  title: JSX.Element;
  subtitle: JSX.Element;
  description: JSX.Element;
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
  shareLink?: string;
}

export const ShareModal = ({
  title,
  subtitle,
  description,
  open,
  onOpenChange,
  shareLink,
}: ShareModalProps) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} placement="center">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content data-testid="share-modal">
            <Dialog.Header>
              <Dialog.Title>{title}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Dialog.Description fontWeight="semibold">
                {subtitle}
              </Dialog.Description>
              <Clipboard.Root value={shareLink} marginTop="md">
                <InputGroup
                  endElement={
                    <Clipboard.Trigger asChild>
                      <IconButton variant="surface" size="xs" marginEnd="-2">
                        <Clipboard.Indicator data-testid="copy-button" asChild>
                          <LuClipboardCopy />
                        </Clipboard.Indicator>
                      </IconButton>
                    </Clipboard.Trigger>
                  }
                  marginBottom="md"
                >
                  <Clipboard.Input asChild>
                    <Input readOnly />
                  </Clipboard.Input>
                </InputGroup>
              </Clipboard.Root>
              <Text color="gray.500">{description}</Text>
            </Dialog.Body>
            <Dialog.CloseTrigger>
              <Icon>
                <IoMdClose />
              </Icon>
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
