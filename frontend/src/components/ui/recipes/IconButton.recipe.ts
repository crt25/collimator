import { defineRecipe } from "@chakra-ui/react";

export const IconButtonRecipe = defineRecipe({
  variants: {
    variant: {
      primary: {
        backgroundColor: "buttonBg",
        color: "buttonFg",
        borderRadius: "sm !important",
        padding: "sm",

        _hover: {
          backgroundColor: "accentHighlight",
        },
      },
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

export default IconButtonRecipe;
