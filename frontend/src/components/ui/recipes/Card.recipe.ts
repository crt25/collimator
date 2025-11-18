import { defineSlotRecipe } from "@chakra-ui/react";
import { cardAnatomy } from "@chakra-ui/react/anatomy";

export const CardRecipe = defineSlotRecipe({
  slots: cardAnatomy.keys(),
  variants: {
    variant: {
      dashboard: {
        root: {
          cursor: "pointer",
          padding: "lg",
          maxHeight: "3xs",
          borderWidth: "thin",
          height: "3xs",
          _hover: {
            opacity: 0.8,
          },
        },
      },
    },
  },
});

export default CardRecipe;
