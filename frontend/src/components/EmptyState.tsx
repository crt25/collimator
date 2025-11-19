import { EmptyState as ChakraEmptyState, VStack } from "@chakra-ui/react";

export const EmptyState = ({ title }: { title: string }) => {
  return (
    <ChakraEmptyState.Root>
      <ChakraEmptyState.Content>
        <VStack textAlign="center">
          <ChakraEmptyState.Title>{title}</ChakraEmptyState.Title>
        </VStack>
      </ChakraEmptyState.Content>
    </ChakraEmptyState.Root>
  );
};
