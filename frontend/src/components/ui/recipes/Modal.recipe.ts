import { defineSlotRecipe } from "@chakra-ui/react";
import { dialogAnatomy } from "@chakra-ui/react/anatomy";

export const ModalRecipe = defineSlotRecipe({
  slots: dialogAnatomy.keys(),
  base: {
    content: {
      backgroundColor: "bg",
    },
    footer: {
      gap: "md",
    },
    title: {
      fontSize: "xl !important",
      fontWeight: "semibold !important",
      marginBottom: "sm !important",
    },
    closeTrigger: {
      fontSize: "2xl",
      padding: "sm",
      _hover: {
        cursor: "pointer",
      },
    },
  },
});
