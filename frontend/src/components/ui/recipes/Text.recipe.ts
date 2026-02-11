import { defineRecipe } from "@chakra-ui/react";

export const TextRecipe = defineRecipe({
  variants: {
    variant: {
      error: {
        color: "red.500",
      },
    },
  },
});
