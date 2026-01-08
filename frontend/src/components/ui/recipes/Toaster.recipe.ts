import { defineSlotRecipe } from "@chakra-ui/react";
import { toastAnatomy } from "@chakra-ui/react/anatomy";

export const ToasterRecipe = defineSlotRecipe({
  slots: toastAnatomy.keys(),
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
