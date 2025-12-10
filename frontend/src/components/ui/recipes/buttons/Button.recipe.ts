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
        backgroundColor: "buttonSecondaryBg",
        color: "buttonSecondaryFg",
        borderWidth: "thin",
        borderColor: "buttonSecondaryBorder",
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
          color: "accentHighlight",
          opacity: 0.8,
        },
      },
      toastClose: {
        backgroundColor: "transparent",
        borderWidth: "thin !important",
        borderColor: "buttonSecondaryBorder !important",
        marginRight: "md !important",
        color: "white",
        padding: "sm",
        borderRadius: "sm !important",
        marginTop: "lg !important",
        cursor: "pointer",
        transition: "color 0.2s ease",
      },
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

export default ButtonRecipe;
