import { defineSlotRecipe } from "@chakra-ui/react";
import { menuAnatomy } from "@chakra-ui/react/anatomy";

export const DropdownMenuRecipe = defineSlotRecipe({
  slots: menuAnatomy.keys(),
  base: {
    trigger: {
      borderWidth: "thin",
      borderStyle: "solid",
      borderRadius: "sm !important",
      borderColor: "gray.200",
      padding: "md",
      fontWeight: "semibold",
    },
    content: {
      backgroundColor: "bg",
      cursor: "pointer",
    },
  },
  variants: {
    variant: {
      primary: {},
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});
