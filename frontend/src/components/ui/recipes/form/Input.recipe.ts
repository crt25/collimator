import { defineRecipe } from "@chakra-ui/react";

export const InputRecipe = defineRecipe({
  base: {
    borderWidth: "thin",
  },
  variants: {
    variant: {
      primary: {
        width: "100%",
        maxWidth: "100%",
        padding: "sm",
        _placeholder: {
          color: "inputPlaceHolderColor",
        },
      },
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});
