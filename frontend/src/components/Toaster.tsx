import {
  Toaster as ChakraToaster,
  Portal,
  Spinner,
  Stack,
  Toast,
  createToaster,
  chakra,
} from "@chakra-ui/react";
import { IoMdClose } from "react-icons/io";

export const toaster = createToaster({
  placement: "top",
  pauseOnPageIdle: true,
  duration: 5000,
});

const StyledCloseTrigger = chakra(Toast.CloseTrigger, {
  base: {
    position: "static",
    borderWidth: "thin",
    padding: "sm",
    borderRadius: "sm !important",
    cursor: "pointer",
    _hover: {
      opacity: 0.8,
    },
  },
});

export const Toaster = () => {
  return (
    <Portal>
      <ChakraToaster toaster={toaster} insetInline={{ mdDown: "4" }}>
        {(toast) => (
          <Toast.Root width="auto">
            <Stack direction="row" align="center" gap="md" width="full">
              {toast.type === "loading" ? (
                <Spinner size="sm" color="blue.solid" />
              ) : (
                <Toast.Indicator />
              )}
              <Stack flex="1" gap="1">
                {toast.title && <Toast.Title>{toast.title}</Toast.Title>}
                {toast.description && (
                  <Toast.Description>{toast.description}</Toast.Description>
                )}
              </Stack>
              <Stack direction="row" align="center" gap="sm">
                {toast.action && (
                  <Toast.ActionTrigger data-testid={toast.meta?.actionTestId}>
                    {toast.action.label}
                  </Toast.ActionTrigger>
                )}
                {toast.closable && (
                  <StyledCloseTrigger>
                    <IoMdClose />
                  </StyledCloseTrigger>
                )}
              </Stack>
            </Stack>
          </Toast.Root>
        )}
      </ChakraToaster>
    </Portal>
  );
};
