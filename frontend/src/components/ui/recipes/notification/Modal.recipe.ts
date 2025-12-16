import { defineSlotRecipe } from "@chakra-ui/react";

export const ModalRecipe = defineSlotRecipe({
  slots: [
    "content",
    "positioner",
    "title",
    "footer",
    "warningText",
    "closeTrigger",
  ],
  base: {
    content: {
      backgroundColor: "bg",
    },
    footer: {
      gap: "md",
    },
    warningText: {
      color: "fgTertiary",
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
