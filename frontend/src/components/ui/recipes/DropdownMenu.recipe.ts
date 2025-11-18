import { defineSlotRecipe } from "@chakra-ui/react";

export const DropdownMenuRecipe = defineSlotRecipe({
  slots: ["trigger", "content"],
  base: {
    trigger: {
      borderWidth: "thin",
      borderStyle: "solid",
      borderRadius: "sm !important",
      borderColor: "gray.200",
      padding: "sm",
      fontWeight: "semibold",
    },
    content: {
      backgroundColor: "bg",
      borderColor: "headerBorder",
    },
  },
});
