import { defineRecipe } from "@chakra-ui/react";

export const IconButtonRecipe = defineRecipe({
  variants: {
    variant: {
      primary: {
        backgroundColor: "iconButtonBackgroundColor",
        color: "buttonFg",
        borderRadius: "sm !important",
        padding: "sm",
        cursor: "pointer",
        transition: "background-color 0.2s ease",

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
