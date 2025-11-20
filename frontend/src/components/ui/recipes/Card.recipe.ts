import { defineSlotRecipe } from "@chakra-ui/react";
import { cardAnatomy } from "@chakra-ui/react/anatomy";

export const CardRecipe = defineSlotRecipe({
  slots: cardAnatomy.keys(),
  variants: {
    variant: {
      dashboard: {
        root: {
          cursor: "pointer",
          paddingLeft: "lg",
          paddingBottom: "lg",
          borderWidth: "thin",
          _hover: {
            opacity: 0.8,
          },
        },
      },
    },
  },
});
