import { IconButton as ChakraIconButton } from "@chakra-ui/react";
import styled from "@emotion/styled";

export const IconButton = styled(ChakraIconButton)`
  background-color: var(--button-background-color);
  color: var(--button-foreground-color);
  border-radius: var(--border-radius);
  padding: 0.5rem 1rem;

  &:hover {
    background-color: var(--accent-color-highlight);
  }
`;
