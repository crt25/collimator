import { defineSlotRecipe } from "@chakra-ui/react";

export const ToasterRecipe = defineSlotRecipe({
  slots: [
    "root",
    "title",
    "description",
    "actionTrigger",
    "closeTrigger",
    "indicator",
  ],
  base: {
    root: {
      width: "auto",
      maxWidth: "lg",
      minWidth: "sm",
    },
    title: {},
    description: {
      fontSize: "md",
    },
    actionTrigger: {
      fontSize: "sm",
      borderWidth: "thin",
      borderRadius: "sm",
      borderColor: "buttonSecondaryBorder",
      _hover: {
        opacity: 0.8,
      },
    },
    closeTrigger: {},
    indicator: {},
  },
});
