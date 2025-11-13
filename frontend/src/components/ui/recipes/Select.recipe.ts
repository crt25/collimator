import { defineSlotRecipe } from "@chakra-ui/react";

export const SelectRecipe = defineSlotRecipe({
  slots: ["content", "root", "trigger", "label"],
  base: {
    label: {
      fontSize: "sm",
    },
    content: {
      zIndex: "overlay",
      backgroundColor: "bg",
    },
    trigger: {
      borderRadius: "sm !important",
      backgroundColor: "selectBg !important",
    },
  },
});
