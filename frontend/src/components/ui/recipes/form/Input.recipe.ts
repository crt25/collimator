import { defineRecipe, defineSlotRecipe } from "@chakra-ui/react";

export const InputRecipe = defineRecipe({
  variants: {
    variant: {
      buttonForm: {
        padding: "{space.sm space.md}",
        backgroundColor: "buttonBg",
        color: "buttonFg",
        cursor: "pointer",
        textAlign: "center",
        width: "fit-content",
        _disabled: {
          backgroundColor: "buttonDisabledBg",
        },
        _hover: {
          backgroundColor: "accent",
          opacity: 0.8,
        },
      },
    },
  },
});

export const FieldRecipe = defineSlotRecipe({
  slots: ["label"],
  base: {
    label: {
      fontSize: "sm",
      fontWeight: "semibold",
      marginBottom: "xs",
      display: "block",
    },
  },
});
