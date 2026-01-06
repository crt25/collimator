import { Flex, chakra } from "@chakra-ui/react";

export const FlexContainer = chakra(Flex, {
  base: {
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "md",
    marginTop: "4xl !important",
  },
});
