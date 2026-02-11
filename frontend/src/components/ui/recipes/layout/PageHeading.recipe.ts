import { defineRecipe } from "@chakra-ui/react";

export const PageHeadingRecipe = defineRecipe({
  variants: {
    variant: {
      title: {
        fontSize: "2xl",
      },
      description: {
        fontSize: "lg",
        fontWeight: "normal",
      },
    },
  },
  defaultVariants: {
    variant: "title",
  },
});
