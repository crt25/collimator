import { defineRecipe } from "@chakra-ui/react";

export const ButtonRecipe = defineRecipe({
  base: {
    borderRadius: "sm !important",
  },
  variants: {
    variant: {
      primary: {
        backgroundColor: "buttonBg",
        color: "buttonFg",
        _hover: {
          backgroundColor: "accent !important",
          opacity: 0.8,
        },
      },
      secondary: {
        borderWidth: "thin",
      },
      danger: {
        backgroundColor: "buttonDangerBg",
        color: "buttonDangerFg",
      },
      detail: {
        backgroundColor: "transparent",
        color: "fgSecondary",
        width: "full",
        justifyContent: "flex-end",
        _hover: {
          opacity: 0.8,
        },
      },
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

export default ButtonRecipe;
