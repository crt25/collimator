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

export const ButtonVariant = {
  primary: "primary",
  secondary: "secondary",
  danger: "danger",
  detail: "detail",
} as const;

export type ButtonVariant = keyof NonNullable<
  (typeof ButtonRecipe)["variants"]
>["variant"];

export default ButtonRecipe;
