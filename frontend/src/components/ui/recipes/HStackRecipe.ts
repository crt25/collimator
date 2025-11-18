import { defineRecipe } from "@chakra-ui/react";

export const HStackRecipe = defineRecipe({
  variants: {
    variant: {
      primary: {
        gap: "sm",
      },
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

export default HStackRecipe;
