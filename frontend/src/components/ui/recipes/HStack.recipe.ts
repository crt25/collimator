import { defineRecipe } from "@chakra-ui/react";

export const HStackRecipe = defineRecipe({
  variants: {
    variant: {
      primary: {
        gap: "sm",
      },
    },
  },
});

export default HStackRecipe;
