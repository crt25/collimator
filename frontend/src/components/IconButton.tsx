import { IconButton as ChakraIconButton, chakra } from "@chakra-ui/react";

export const IconButton = chakra(ChakraIconButton, {
  base: {
    backgroundColor: "buttonBg",
    color: "buttonFg",
    borderRadius: "sm !important",
    padding: "sm",

    _hover: {
      backgroundColor: "accentHighlight",
    },
  },
});
