import { defineRecipe } from "@chakra-ui/react";

export const hstackRecipe = defineRecipe({
  variants: {
    variant: {
      primary: {
        gap: "sm",
      },
    },
  },
});

export default hstackRecipe;
