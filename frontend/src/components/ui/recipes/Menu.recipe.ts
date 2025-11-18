import { defineSlotRecipe } from "@chakra-ui/react";
import { menuAnatomy } from "@chakra-ui/react/anatomy";

export const MenuRecipe = defineSlotRecipe({
  slots: menuAnatomy.keys(),
  base: {
    item: {
      cursor: "pointer",
      _hover: {
        backgroundColor: "gray.200",
      },
    },
  },
  variants: {
    variant: {
      emphasized: {
        trigger: {
          backgroundColor: "fg",
          color: "bg",
          fontWeight: "normal",
        },
      },
    },
  },
});
