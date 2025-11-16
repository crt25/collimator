import { defineSlotRecipe } from "@chakra-ui/react";

export const SelectRecipe = defineSlotRecipe({
  slots: ["content", "root", "trigger", "label"],
  base: {
    label: {
      fontSize: "sm",
      fontWeight: "semibold",
    },
    content: {
      zIndex: "overlay",
      backgroundColor: "bg",
    },
    trigger: {
      borderRadius: "sm !important",
      borderStyle: "none !important",
      backgroundColor: "selectBg !important",
    },
  },
});
