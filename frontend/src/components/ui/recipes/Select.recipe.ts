import { defineSlotRecipe } from "@chakra-ui/react";

export const SelectRecipe = defineSlotRecipe({
  slots: ["content", "root", "trigger", "label", "control"],
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
    control: {
      borderWidth: "thin",
      borderColor: "border",
      borderRadius: "sm !important",
      _invalid: {
        borderColor: "error",
      },
    },
  },
});
