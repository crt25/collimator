import { defineSlotRecipe } from "@chakra-ui/react";
import { cardAnatomy } from "@chakra-ui/react/anatomy";

export const CardRecipe = defineSlotRecipe({
  slots: cardAnatomy.keys(),
  base: {
    root: {
      cursor: "pointer",
      padding: "lg",
      maxHeight: "3xs",
      height: "3xs",
      _hover: {
        opacity: 0.8,
      },
    },
  },
});

export default CardRecipe;
