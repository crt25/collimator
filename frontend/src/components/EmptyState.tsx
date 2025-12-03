import { EmptyState as ChakraEmptyState, VStack } from "@chakra-ui/react";
import { JSX } from "react";

export const EmptyState = ({ title }: { title: JSX.Element }) => {
  return (
    <ChakraEmptyState.Root>
      <ChakraEmptyState.Content data-testid="empty-state-content">
        <VStack textAlign="center">
          <ChakraEmptyState.Title>{title}</ChakraEmptyState.Title>
        </VStack>
      </ChakraEmptyState.Content>
    </ChakraEmptyState.Root>
  );
};
