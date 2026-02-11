import { defineRecipe } from "@chakra-ui/react";

export const IconButtonRecipe = defineRecipe({
  variants: {
    variant: {
      primary: {
        color: "buttonFg",
        borderRadius: "sm !important",
        padding: "sm",
        cursor: "pointer",
        transition: "background-color 0.2s ease",
      },
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

export default IconButtonRecipe;
